from __future__ import annotations

import os
import json
import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.orchestrator import Orchestrator
from services.hindsight_service import HindsightService
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI") or "mongodb://localhost:27017")
db = client["revela_ai"]

users_collection = db["users"]
candidates_collection = db["candidates"]
sessions_collection = db["sessions"]
memory_collection = db["memory"]
evaluations_collection = db["evaluations"]

BASE_DIR = Path(__file__).resolve().parent
CANDIDATES_FILE = BASE_DIR / "data" / "synthetic_candidates.json"
MEMORY_FILE = BASE_DIR / "data" / "memory.json"
ANALYTICS_FILE = BASE_DIR / "logs" / "analytics.json"
SETTINGS_FILE = BASE_DIR / "data" / "settings.json"


def _now_iso() -> str:
    return datetime.utcnow().isoformat()


def _read_json(path: Path, fallback: Any):
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except Exception:
        return fallback


def _write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)


def _merge_settings(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    merged = dict(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = _merge_settings(merged[key], value)
        else:
            merged[key] = value
    return merged


def _default_settings() -> dict[str, Any]:
    return {
        "profile": {
            "name": "Revela Operator",
            "email": "",
            "role": "Principal Hiring Architect",
        },
        "api": {
            "apiBaseUrl": "http://localhost:5000/api",
        },
        "model": {
            "defaultTier": "efficiency",
            "confidenceThreshold": 0.7,
            "maxLatencyMs": 2500,
        },
        "memory": {
            "cloudSync": bool(os.getenv("HINDSIGHT_API_KEY")),
            "retainReflections": True,
            "localStoragePath": "data/memory.json",
        },
        "notifications": {
            "emailDigest": True,
            "budgetAlerts": True,
            "candidateAlerts": False,
        },
    }


def _settings_snapshot() -> dict[str, Any]:
    stored = _read_json(SETTINGS_FILE, {})
    merged = _merge_settings(_default_settings(), stored)
    return {
        "profile": merged["profile"],
        "api": {
            "groqConnected": bool(os.getenv("GROQ_API_KEY")),
            "hindsightConnected": bool(os.getenv("HINDSIGHT_API_KEY")),
            "apiBaseUrl": merged["api"]["apiBaseUrl"],
        },
        "model": merged["model"],
        "memory": merged["memory"],
        "notifications": merged["notifications"],
    }


def _slugify_candidate_id(name: str) -> str:
    candidate_id = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
    if not candidate_id:
        candidate_id = f"candidate_{int(datetime.utcnow().timestamp())}"
    return candidate_id[:64]


def _persist_candidate_catalog(candidates: list[dict[str, Any]]) -> None:
    # Persist candidate list to MongoDB by upserting each record
    for item in candidates:
        key = {"id": item.get("id")}
        candidates_collection.update_one(key, {"$set": item}, upsert=True)


def _candidate_catalog() -> list[dict[str, Any]]:
    base_candidates = list(candidates_collection.find({}, {"_id": 0}))
    memory_candidates_cursor = memory_collection.find({}, {"candidateId": 1})
    memory_candidates = [doc.get("candidateId") for doc in memory_candidates_cursor]
    known_ids = {item.get("id") for item in base_candidates}
    for candidate_id in memory_candidates:
        if candidate_id not in known_ids:
            base_candidates.append({
                "id": candidate_id,
                "name": candidate_id,
                "email": "",
                "role": "Interview Candidate",
                "experience_years": 0,
                "weak_areas": [],
                "strengths": [],
            })
    return base_candidates


def _history_entry(entry: dict[str, Any]) -> dict[str, Any]:
    return {
        "timestamp": entry.get("timestamp", _now_iso()),
        "sessionId": entry.get("session_id", "unknown"),
        "category": entry.get("category", "General"),
        "keyFinding": entry.get("key_finding"),
        "question": entry.get("question"),
        "response": entry.get("response"),
        "score": entry.get("score"),
        "fullReflection": entry.get("full_reflection"),
        "impactScore": entry.get("impact_score", 0.5),
    }


def _last_reflection(history: list[dict[str, Any]]) -> str | None:
    reflections = [item for item in history if item.get("category") == "Reflection"]
    if not reflections:
        return None
    latest = reflections[-1]
    return latest.get("fullReflection") or latest.get("keyFinding")


def _memory_context(candidate_id: str, service: HindsightService | None = None) -> dict[str, Any]:
    hindsight = service or HindsightService()
    context = hindsight.get_candidate_context(candidate_id)
    history = [_history_entry(item) for item in context.get("history", [])]
    session_count = int(context.get("session_count", 0))

    return {
        "history": history,
        "weakAreas": context.get("weak_areas", []),
        "strengths": context.get("strengths", []),
        "sessionCount": session_count,
        "summary": (
            f"Returning candidate with {session_count} completed session"
            f"{'' if session_count == 1 else 's'}."
            if session_count
            else "No historical interview memory yet."
        ),
        "lastReflection": _last_reflection(history),
    }


def _candidate_status(session_count: int, strengths: list[str], weak_areas: list[str]) -> str:
    if session_count and len(strengths) >= len(weak_areas):
        return "ready"
    if session_count and len(weak_areas) > len(strengths):
        return "at-risk"
    if session_count:
        return "returning"
    return "new"


def _candidate_payload(raw: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    history = context.get("history", [])
    return {
        "id": raw.get("id"),
        "name": raw.get("name"),
        "email": raw.get("email", ""),
        "role": raw.get("role"),
        "experienceYears": raw.get("experience_years", 0),
        "weakAreas": sorted(set((raw.get("weak_areas") or []) + (context.get("weakAreas") or []))),
        "strengths": sorted(set((raw.get("strengths") or []) + (context.get("strengths") or []))),
        "interviewCount": context.get("sessionCount", 0),
        "status": _candidate_status(
            context.get("sessionCount", 0),
            context.get("strengths", []),
            context.get("weakAreas", []),
        ),
        "lastActiveAt": history[-1]["timestamp"] if history else None,
    }


def _extract_recommendations(reflection: str | None) -> list[str]:
    if not reflection:
        return []
    lines = [line.strip()[2:].strip() for line in reflection.splitlines() if line.strip().startswith("- ")]
    return lines[:5]


def _candidate_profile(candidate_id: str) -> dict[str, Any] | None:
    hindsight = HindsightService()
    raw = next((item for item in _candidate_catalog() if item.get("id") == candidate_id), None)
    if not raw:
        return None

    context = _memory_context(candidate_id, hindsight)
    candidate = _candidate_payload(raw, context)

    grouped: dict[str, list[dict[str, Any]]] = {}
    for item in context["history"]:
        grouped.setdefault(item["sessionId"], []).append(item)

    sessions = []
    for session_id, entries in grouped.items():
        scored = [entry["score"] for entry in entries if isinstance(entry.get("score"), (int, float))]
        average_score = sum(scored) / len(scored) if scored else 0.0
        sessions.append(
            {
                "sessionId": session_id,
                "startedAt": entries[0]["timestamp"] if entries else _now_iso(),
                "turns": len([entry for entry in entries if entry.get("category") == "Interaction"]),
                "averageScore": round(average_score, 1),
                "lastQuestion": next((entry.get("question") for entry in reversed(entries) if entry.get("question")), None),
                "reflection": next(
                    (
                        entry.get("fullReflection") or entry.get("keyFinding")
                        for entry in reversed(entries)
                        if entry.get("category") == "Reflection"
                    ),
                    None,
                ),
            }
        )

    sessions.sort(key=lambda item: item["startedAt"])
    all_scores = [session["averageScore"] for session in sessions if session["averageScore"]]
    average_score = sum(all_scores) / len(all_scores) if all_scores else 0.0
    health_score = (
        round((len(context["strengths"]) / (len(context["strengths"]) + len(context["weakAreas"]))) * 100)
        if context["strengths"] or context["weakAreas"]
        else 50
    )
    readiness_score = max(
        0,
        min(
            100,
            round(
                average_score * 10
                + len(context["strengths"]) * 8
                - len(context["weakAreas"]) * 6
                + context["sessionCount"] * 4
            ),
        ),
    )
    improvement_score = round((sessions[-1]["averageScore"] - sessions[0]["averageScore"]) if len(sessions) > 1 else 0.0)

    return {
        **candidate,
        "context": context,
        "sessions": sessions,
        "metrics": {
            "healthScore": health_score,
            "readinessScore": readiness_score,
            "averageScore": round(average_score, 1),
            "improvementScore": improvement_score,
            "interactions": len([entry for entry in context["history"] if entry.get("category") == "Interaction"]),
        },
        "recommendations": _extract_recommendations(context.get("lastReflection")),
    }


def _budget_status(total_cost: float, limit: float = 5.0) -> str:
    percent = (total_cost / limit) * 100 if limit else 0
    if percent > 90:
        return "critical"
    if percent > 70:
        return "low"
    return "normal"


def _live_analytics_logs() -> list[dict[str, Any]]:
    logs = _read_json(ANALYTICS_FILE, [])
    with SESSION_LOCK:
        for record in SESSION_REGISTRY.values():
            logs.extend(record.orchestrator.analytics_service.buffer)
    return logs


def _analytics_logs() -> list[dict[str, Any]]:
    logs = []
    for item in _live_analytics_logs():
        logs.append(
            {
                "timestamp": item.get("timestamp", _now_iso()),
                "model": item.get("model", "unknown"),
                "cost": item.get("cost", 0.0),
                "latencyMs": item.get("latency_ms", item.get("latencyMs", 0.0)),
                "tokens": item.get("tokens", 0),
                "sessionId": item.get("session_id", item.get("sessionId", "unknown")),
                "rationale": item.get("rationale", "N/A"),
                "savings": item.get("savings", 0.0),
                "confidence": item.get("confidence", 1.0),
                "policy": item.get("policy"),
            }
        )
    return logs


def _heatmap(logs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    hours = ["09", "11", "13", "15", "17", "19"]
    cells = []
    for day in days:
        for hour in hours:
            value = 0
            for item in logs:
                dt = datetime.fromisoformat(item["timestamp"])
                item_day = days[dt.weekday()]
                item_hour = dt.hour
                if item_day == day and int(hour) <= item_hour < int(hour) + 2:
                    value += 1
            cells.append({"day": day, "hour": hour, "value": value})
    return cells


def _breakdown(profiles: list[dict[str, Any]], key: str, tone: str) -> list[dict[str, Any]]:
    counts: dict[str, int] = {}
    for profile in profiles:
        for item in profile["context"][key]:
            counts[item] = counts.get(item, 0) + 1
    return [
        {"label": label, "value": value, "tone": tone}
        for label, value in sorted(counts.items(), key=lambda pair: pair[1], reverse=True)[:6]
    ]


def _analytics_summary() -> dict[str, Any]:
    profiles = [profile for candidate in _candidate_catalog() if (profile := _candidate_profile(candidate["id"]))]
    logs = _analytics_logs()

    total_cost = sum(item["cost"] for item in logs)
    total_savings = sum(item["savings"] for item in logs)
    avg_latency = sum(item["latencyMs"] for item in logs) / len(logs) if logs else 0.0
    avg_confidence = sum(item["confidence"] for item in logs) / len(logs) if logs else 1.0
    total_tokens = sum(item["tokens"] for item in logs)
    budget_status = _budget_status(total_cost)

    model_counts: dict[str, int] = {}
    for item in logs:
        model_counts[item["model"]] = model_counts.get(item["model"], 0) + 1

    activity_feed = [
        {
            "id": f"{item['sessionId']}-{index}",
            "title": f"{item['model']} routed a candidate interaction",
            "description": f"{item['rationale']} · {item['tokens']:,} tokens",
            "tone": "warning" if item["confidence"] < 0.5 else "neutral",
            "timestamp": item["timestamp"],
        }
        for index, item in enumerate(reversed(logs[-8:]))
    ]

    strengths = _breakdown(profiles, "strengths", "positive")
    weaknesses = _breakdown(profiles, "weakAreas", "negative")

    insights: list[dict[str, Any]] = []
    if budget_status == "critical":
        insights.append(
            {
                "id": "budget-critical",
                "title": "Budget headroom is low",
                "summary": "AI routing is nearing the configured budget threshold. Review prompt complexity or performance-tier usage before the next batch.",
                "severity": "high",
                "metric": "Budget",
            }
        )
    elif budget_status == "low":
        insights.append(
            {
                "id": "budget-low",
                "title": "Budget consumption is increasing",
                "summary": "Current evaluation spend is growing. Efficiency routing is active to preserve budget while still delivering adaptive probes.",
                "severity": "medium",
                "metric": "Budget",
            }
        )

    if total_savings > 0:
        insights.append(
            {
                "id": "cost-savings",
                "title": "Measured cost savings available",
                "summary": f"The routing layer has saved ${total_savings:.2f} compared to the GPT-4o baseline on the current log history.",
                "severity": "low",
                "metric": "Savings",
            }
        )

    if avg_confidence < 0.75:
        insights.append(
            {
                "id": "confidence-alert",
                "title": "Model confidence is soft",
                "summary": "Average confidence across recent candidate evaluations is below 75%. Consider reviewing question difficulty or prompt quality.",
                "severity": "medium",
                "metric": "Confidence",
            }
        )

    if weaknesses:
        insights.append(
            {
                "id": "top-gap",
                "title": "Most repeated candidate gap",
                "summary": f"{weaknesses[0]['label']} appears most frequently across candidate weakness profiles and should be addressed in follow-up rounds.",
                "severity": "high",
                "metric": f"{weaknesses[0]['value']} mentions",
            }
        )

    if model_counts.get("llama-3.3-70b-versatile", 0) > model_counts.get("llama-3.1-8b-instant", 0):
        insights.append(
            {
                "id": "performance-usage",
                "title": "High-performance routing is active",
                "summary": "More interactions are being escalated to the performance tier than the efficiency tier, reflecting higher task complexity.",
                "severity": "medium",
                "metric": "Routing",
            }
        )

    if not insights:
        insights.append(
            {
                "id": "steady-state",
                "title": "Analytics are stable",
                "summary": "No strong signals yet — continue collecting candidate interactions to power richer recommendations.",
                "severity": "low",
                "metric": "Stability",
            }
        )

    return {
        "totalCost": total_cost,
        "totalSavings": total_savings,
        "avgLatency": avg_latency,
        "avgConfidence": avg_confidence,
        "totalTokens": total_tokens,
        "sessionCount": len({item["sessionId"] for item in logs}),
        "budgetStatus": _budget_status(total_cost),
        "modelDistribution": [{"label": label, "value": value} for label, value in model_counts.items()],
        "scoreTrend": [
            {
                "label": f"{profile['name'].split(' ')[0]} S{index + 1}",
                "value": session["averageScore"],
                "benchmark": 7.5,
            }
            for profile in profiles
            for index, session in enumerate(profile["sessions"])
        ],
        "strengths": strengths,
        "weaknesses": weaknesses,
        "performanceHeatmap": _heatmap(logs),
        "activityFeed": activity_feed,
        "insights": insights,
        "logs": logs,
    }


def _overview() -> dict[str, Any]:
    candidates = []
    for raw in _candidate_catalog():
        context = _memory_context(raw["id"])
        candidates.append(_candidate_payload(raw, context))

    profiles = [profile for candidate in candidates if (profile := _candidate_profile(candidate["id"]))]
    analytics = _analytics_summary()

    with SESSION_LOCK:
        circuit_open = any(record.orchestrator.cascade_service.circuit_open for record in SESSION_REGISTRY.values())

    return {
        "totalSessions": analytics["sessionCount"],
        "activeCandidates": len(candidates),
        "aiActivity": len(analytics["logs"]),
        "averageScore": (
            round(sum(profile["metrics"]["averageScore"] for profile in profiles) / len(profiles), 1)
            if profiles
            else 0.0
        ),
        "candidateStats": [
            {"label": "Returning", "value": len([item for item in candidates if item["interviewCount"] > 0])},
            {"label": "Ready", "value": len([item for item in candidates if item["status"] == "ready"]), "tone": "positive"},
            {"label": "At risk", "value": len([item for item in candidates if item["status"] == "at-risk"]), "tone": "negative"},
        ],
        "interviewScoreTrends": analytics["scoreTrend"],
        "strengthsAnalysis": analytics["strengths"],
        "weaknessAnalysis": analytics["weaknesses"],
        "modelUsage": analytics["modelDistribution"],
        "analyticsSummary": analytics,
        "memoryHighlights": sorted(profiles, key=lambda item: item["context"]["sessionCount"], reverse=True)[:3],
        "activityFeed": analytics["activityFeed"],
        "policyStatus": {
            "circuitStatus": "OPEN" if circuit_open else "CLOSED",
            "budgetStatus": analytics["budgetStatus"],
            "activePolicy": "Budget Velocity Control" if analytics["budgetStatus"] in {"low", "critical"} else "Performance First",
        },
    }


def _audit_payload(audit: dict[str, Any], model: str) -> dict[str, Any]:
    return {
        "traceId": audit.get("trace_id", audit.get("traceId", "unknown")),
        "rationale": audit.get("rationale", "N/A"),
        "latencyMs": audit.get("latency_ms", audit.get("latencyMs", 0.0)),
        "savings": audit.get("savings", 0.0),
        "confidence": audit.get("confidence", 1.0),
        "circuitStatus": audit.get("circuit_status", audit.get("circuitStatus", "CLOSED")),
        "policy": audit.get("policy", "Standard Routing"),
        "model": audit.get("model", model),
        "actualCost": audit.get("actual_cost", audit.get("actualCost", 0.0)),
    }


def _question_payload(question_data: dict[str, Any], index: int) -> dict[str, Any]:
    model = question_data.get("model", "unknown")
    audit = _audit_payload(question_data.get("audit", {}), model)
    return {
        "id": f"{audit['traceId']}-{index}",
        "text": question_data.get("question", ""),
        "category": "Adaptive Interview",
        "difficulty": question_data.get("difficulty", "Medium"),
        "modelUsed": model,
        "audit": audit,
    }


def _trace(label: str, tone: str = "info") -> dict[str, Any]:
    return {"id": label.lower().replace(" ", "-"), "label": label, "tone": tone, "timestamp": _now_iso()}


def _build_session_messages(record: SessionRecord) -> list[dict[str, Any]]:
    messages: list[dict[str, Any]] = []
    for item in record.orchestrator.session_history:
        if question := item.get("question"):
            messages.append(
                {
                    "id": f"{record.candidate_data['id']}-{len(messages) + 1}-q",
                    "role": "assistant",
                    "type": "question",
                    "content": question,
                    "timestamp": item.get("timestamp", _now_iso()),
                    "meta": {
                        "model": item.get("evaluation", {}).get("runtime_metrics", {}).get("model"),
                        "difficulty": item.get("difficulty", "Medium")
                    }
                }
            )
        if response := item.get("response"):
            messages.append(
                {
                    "id": f"{record.candidate_data['id']}-{len(messages) + 1}-a",
                    "role": "candidate",
                    "type": "answer",
                    "content": response,
                    "timestamp": item.get("timestamp", _now_iso())
                }
            )
        if evaluation := item.get("evaluation"):
            messages.append(
                {
                    "id": f"{record.candidate_data['id']}-{len(messages) + 1}-e",
                    "role": "system",
                    "type": "evaluation",
                    "content": evaluation.get("feedback", ""),
                    "timestamp": item.get("timestamp", _now_iso()),
                    "meta": {
                        "score": evaluation.get("score"),
                        "confidence": evaluation.get("confidenceScore"),
                        "model": evaluation.get("runtimeMetrics", {}).get("model")
                    }
                }
            )
    return messages


def _recommendations(evaluation: dict[str, Any]) -> list[str]:
    recommendations = list(evaluation.get("recommendations") or [])
    if recommendations:
        return recommendations
    if evaluation.get("weaknesses"):
        recommendations.append(f"Review and improve: {evaluation['weaknesses'][0]}")
    recommendations.append("Explain trade-offs, risks, and validation steps more explicitly.")
    return recommendations[:3]


def _evaluation_payload(result: Any) -> dict[str, Any]:
    raw = result.model_dump() if hasattr(result, "model_dump") else result.dict()
    runtime_metrics = raw.get("runtime_metrics", {})
    usage = runtime_metrics.get("usage", {})
    model = runtime_metrics.get("model", "unknown")

    return {
        "questionId": raw.get("question_id", "current"),
        "score": raw.get("score", 0),
        "feedback": raw.get("feedback", ""),
        "confidenceScore": raw.get("confidence_score", 0.0),
        "latencyMs": raw.get("latency_ms", 0.0),
        "category": raw.get("category", "General"),
        "strengths": raw.get("strengths", []),
        "weaknesses": raw.get("weaknesses", []),
        "recommendations": _recommendations(raw),
        "runtimeMetrics": {
            "model": model,
            "audit": _audit_payload(runtime_metrics.get("audit", {}), model),
            "totalCost": runtime_metrics.get("total_cost", 0.0),
            "usage": {
                "promptTokens": usage.get("prompt_tokens", 0),
                "completionTokens": usage.get("completion_tokens", 0),
                "totalTokens": usage.get("total_tokens", 0),
            },
        },
    }


@dataclass
class SessionRecord:
    orchestrator: Orchestrator
    candidate_data: dict[str, Any]
    current_question: dict[str, Any]
    questions_asked: int = 1
    evaluations: list[dict[str, Any]] = field(default_factory=list)


SESSION_REGISTRY: dict[str, SessionRecord] = {}
SESSION_LOCK = Lock()


class CreateCandidateRequest(BaseModel):
    name: str
    email: str = ""
    role: str = "Interview Candidate"
    experienceYears: int = 0
    weakAreas: list[str] = []
    strengths: list[str] = []


class UpdateCandidateRequest(BaseModel):
    name: str | None = None
    email: str | None = None
    role: str | None = None
    experienceYears: int | None = None
    weakAreas: list[str] | None = None
    strengths: list[str] | None = None


class StartSessionRequest(BaseModel):
    candidateId: str
    candidateName: str
    role: str


class SubmitResponseRequest(BaseModel):
    candidateId: str
    answer: str


class ProfileSettings(BaseModel):
    name: str
    email: str
    role: str


class ApiSettings(BaseModel):
    groqConnected: bool = False
    hindsightConnected: bool = False
    apiBaseUrl: str


class ModelSettings(BaseModel):
    defaultTier: str
    confidenceThreshold: float
    maxLatencyMs: int


class MemorySettings(BaseModel):
    cloudSync: bool
    retainReflections: bool
    localStoragePath: str


class NotificationSettings(BaseModel):
    emailDigest: bool
    budgetAlerts: bool
    candidateAlerts: bool


class SettingsSnapshotPayload(BaseModel):
    profile: ProfileSettings
    api: ApiSettings
    model: ModelSettings
    memory: MemorySettings
    notifications: NotificationSettings


app = FastAPI(title="Revela AI API", version="1.0.0")
default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]
configured_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=(configured_origins or default_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/overview")
async def get_overview():
    return _overview()


@app.get("/api/candidates")
async def list_candidates():
    items = []
    for raw in _candidate_catalog():
        items.append(_candidate_payload(raw, _memory_context(raw["id"])))
    return {"items": sorted(items, key=lambda item: item["name"])}


@app.get("/api/candidates/{candidate_id}")
async def get_candidate(candidate_id: str):
    profile = _candidate_profile(candidate_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return profile


@app.post("/api/candidates")
async def create_candidate(payload: CreateCandidateRequest):
    candidate_id = _slugify_candidate_id(payload.name)
    existing = candidates_collection.find_one({"id": candidate_id})
    if existing:
        raise HTTPException(status_code=409, detail="Candidate already exists")

    new_candidate = {
        "id": candidate_id,
        "name": payload.name,
        "email": payload.email,
        "role": payload.role,
        "experience_years": payload.experienceYears,
        "weak_areas": payload.weakAreas,
        "strengths": payload.strengths,
        "createdAt": _now_iso(),
    }
    candidates_collection.insert_one(new_candidate)
    return _candidate_payload(new_candidate, _memory_context(candidate_id))


@app.put("/api/candidates/{candidate_id}")
async def update_candidate(candidate_id: str, payload: UpdateCandidateRequest):
    candidate = candidates_collection.find_one({"id": candidate_id})
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    updates: dict[str, Any] = {}
    if payload.name is not None:
        updates["name"] = payload.name
    if payload.email is not None:
        updates["email"] = payload.email
    if payload.role is not None:
        updates["role"] = payload.role
    if payload.experienceYears is not None:
        updates["experience_years"] = payload.experienceYears
    if payload.weakAreas is not None:
        updates["weak_areas"] = payload.weakAreas
    if payload.strengths is not None:
        updates["strengths"] = payload.strengths

    if updates:
        candidates_collection.update_one({"id": candidate_id}, {"$set": updates})
        candidate.update(updates)

    return _candidate_payload(candidate, _memory_context(candidate_id))


@app.get("/api/candidates/{candidate_id}/memory")
async def get_candidate_memory(candidate_id: str):
    return _memory_context(candidate_id)


@app.get("/api/analytics")
async def get_analytics():
    return _analytics_summary()


@app.get("/api/settings")
async def get_settings():
    return _settings_snapshot()


@app.put("/api/settings")
async def update_settings(payload: SettingsSnapshotPayload):
    _write_json(
        SETTINGS_FILE,
        {
            "profile": payload.profile.model_dump(),
            "api": {"apiBaseUrl": payload.api.apiBaseUrl},
            "model": payload.model.model_dump(),
            "memory": payload.memory.model_dump(),
            "notifications": payload.notifications.model_dump(),
        },
    )
    return _settings_snapshot()


@app.post("/api/sessions/start")
async def start_session(payload: StartSessionRequest):
    raw_candidate = next((item for item in _candidate_catalog() if item.get("id") == payload.candidateId), None)
    candidate_data = {
        "id": payload.candidateId,
        "name": payload.candidateName or (raw_candidate or {}).get("name", payload.candidateId),
        "role": payload.role or (raw_candidate or {}).get("role", "Interview Candidate"),
        "email": (raw_candidate or {}).get("email", ""),
        "experience_years": (raw_candidate or {}).get("experience_years", 0),
    }

    try:
        orchestrator = Orchestrator()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    session_id = orchestrator.start_session(payload.candidateId)
    candidate_data["session_id"] = session_id
    question = await orchestrator.get_next_question(candidate_data)
    memory = _memory_context(payload.candidateId, orchestrator.hindsight_service)

    with SESSION_LOCK:
        SESSION_REGISTRY[session_id] = SessionRecord(
            orchestrator=orchestrator,
            candidate_data=candidate_data,
            current_question=question,
        )

    return {
        "sessionId": session_id,
        "candidate": _candidate_payload(raw_candidate or candidate_data, memory),
        "memory": memory,
        "currentQuestion": _question_payload(question, 1),
        "messages": [
            {
                "id": f"{question.get('audit', {}).get('trace_id', 'unknown')}-initial",
                "role": "assistant",
                "type": "question",
                "content": question.get("question", ""),
                "timestamp": _now_iso(),
                "meta": {
                    "model": question.get("model", "unknown"),
                    "difficulty": question.get("difficulty", "Medium")
                }
            }
        ],
        "trace": [
            _trace("Candidate dossier recalled from persistent memory.", "info"),
            _trace(
                f"Question routed to {question.get('model', 'unknown')} using {question.get('difficulty', 'Medium')} difficulty.",
                "success",
            ),
        ],
    }


@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    with SESSION_LOCK:
        record = SESSION_REGISTRY.get(session_id)
    if not record:
        raise HTTPException(status_code=404, detail="Session not found")

    candidate_id = record.candidate_data["id"]
    memory = _memory_context(candidate_id, record.orchestrator.hindsight_service)
    latest_evaluation = record.evaluations[-1] if record.evaluations else None

    return {
        "sessionId": session_id,
        "candidate": _candidate_payload(record.candidate_data, memory),
        "memory": memory,
        "currentQuestion": _question_payload(record.current_question, record.questions_asked),
        "messages": [*(_build_session_messages(record)), {
            "id": f"{record.current_question.get('audit', {}).get('trace_id', 'unknown')}-current",
            "role": "assistant",
            "type": "question",
            "content": record.current_question.get("question", ""),
            "timestamp": _now_iso(),
            "meta": {
                "model": record.current_question.get("model", "unknown"),
                "difficulty": record.current_question.get("difficulty", "Medium")
            }
        }],
        "trace": [
            _trace("Restored active interview session.", "info")
        ],
        "scoreSeries": [item["score"] for item in record.evaluations],
        "latestEvaluation": latest_evaluation,
    }


@app.post("/api/sessions/{session_id}/message")
async def submit_session_message(session_id: str, payload: SubmitResponseRequest):
    with SESSION_LOCK:
        record = SESSION_REGISTRY.get(session_id)
    if not record:
        raise HTTPException(status_code=404, detail="Session not found")

    evaluation = await record.orchestrator.process_response(
        payload.candidateId,
        record.current_question.get("question", ""),
        payload.answer,
    )
    if evaluation is None:
        raise HTTPException(status_code=500, detail="Evaluation failed")

    evaluation_payload = _evaluation_payload(evaluation)
    record.evaluations.append(evaluation_payload)
    next_question = await record.orchestrator.get_next_question(record.candidate_data)
    record.current_question = next_question
    record.questions_asked += 1

    memory_preview = _memory_context(payload.candidateId, record.orchestrator.hindsight_service)
    trace = [
        _trace(
            f"Response evaluated at {evaluation_payload['score']}/10 with {round(evaluation_payload['confidenceScore'] * 100)}% confidence.",
            "success" if evaluation_payload["score"] >= 7 else "warning" if evaluation_payload["score"] <= 4 else "info",
        ),
        _trace(
            f"Next question escalated via {next_question.get('model', 'unknown')} for continued probing.",
            "info",
        ),
    ]

    return {
        "evaluation": evaluation_payload,
        "nextQuestion": _question_payload(next_question, record.questions_asked),
        "trace": trace,
        "scoreSeries": [item["score"] for item in record.evaluations],
        "memoryPreview": memory_preview,
    }


@app.post("/api/sessions/{session_id}/end")
async def end_session(session_id: str):
    with SESSION_LOCK:
        record = SESSION_REGISTRY.get(session_id)
    if not record:
        raise HTTPException(status_code=404, detail="Session not found")

    reflection = await record.orchestrator.end_session(record.candidate_data)
    updated_context = _memory_context(record.candidate_data["id"], record.orchestrator.hindsight_service)
    scores = [item["score"] for item in record.evaluations]
    average_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    status = "advance" if average_score >= 8 else "follow-up" if average_score >= 6 else "hold"

    summary = {
        "headline": (
            "Candidate showed high-confidence technical signal."
            if status == "advance"
            else "Candidate merits a focused follow-up round."
            if status == "follow-up"
            else "Candidate needs deeper evidence before advancing."
        ),
        "status": status,
        "averageScore": average_score,
        "strengths": updated_context.get("strengths", [])[:4],
        "weaknesses": updated_context.get("weakAreas", [])[:4],
        "reflection": reflection,
    }

    with SESSION_LOCK:
        SESSION_REGISTRY.pop(session_id, None)

    return {
        "reflection": reflection,
        "summary": summary,
        "updatedContext": updated_context,
    }
