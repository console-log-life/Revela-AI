from loguru import logger
import os
import uuid
from typing import List, Dict, Any
from datetime import datetime
import asyncio
from models.schemas import Evaluation
from agents.interviewer import InterviewerAgent
from agents.evaluator import EvaluatorAgent
from agents.memory_manager import MemoryManagerAgent
from agents.router import RouterAgent
from services.groq_service import GroqService
from services.hindsight_service import HindsightService
from services.cascade_service import CascadeService
from services.analytics_service import AnalyticsService

class Orchestrator:
    def __init__(self):
        os.makedirs("logs", exist_ok=True)
        os.makedirs("data", exist_ok=True)
        logger.add("logs/production.log", rotation="10 MB", retention="10 days", level="INFO", enqueue=True)

        self.groq_service      = GroqService()
        self.hindsight_service = HindsightService()
        self.cascade_service   = CascadeService(self.groq_service)
        self.analytics_service = AnalyticsService()

        self.router         = RouterAgent(self.cascade_service)
        self.interviewer    = InterviewerAgent(self.cascade_service)
        self.evaluator      = EvaluatorAgent(self.cascade_service)
        self.memory_manager = MemoryManagerAgent(self.hindsight_service, self.cascade_service)

        self.current_session_id = None
        self.session_history: List[Dict[str, Any]] = []
        self.last_audit = {}

        logger.info("Orchestrator fully initialized.")

    # ── Session lifecycle ────────────────────────────────────────
    def start_session(self, candidate_id: str) -> str:
        self.current_session_id = str(uuid.uuid4())
        self.session_history    = []
        logger.info(f"Session {self.current_session_id[:8]}… started for candidate {candidate_id}")
        return self.current_session_id

    def _sanitize_input(self, text: str) -> str:
        """Mitigate prompt injection using regex-based pattern matching."""
        import re
        patterns = [
            r"(?i)ignore\s+previous\s+instructions",
            r"(?i)disregard\s+all\s+instructions",
            r"(?i)system\s+prompt",
            r"(?i)you\s+are\s+now",
            r"(?i)forget\s+everything",
            r"(?i)jailbreak",
            r"(?i)dan\s+mode",
        ]
        sanitized = text
        for pattern in patterns:
            sanitized = re.sub(pattern, "[FILTERED_THREAT]", sanitized)
        return sanitized

    # ── Dashboard ────────────────────────────────────────────────
    def get_dashboard_context(self, candidate_id: str) -> Dict[str, Any]:
        memory_context   = self.hindsight_service.get_candidate_context(candidate_id)
        budget_status    = self.analytics_service.get_budget_status(limit=5.0)
        analytics_summary = self.analytics_service.get_summary()

        return {
            "memory":        memory_context,
            "budget_status": budget_status,
            "analytics":     analytics_summary,
            "audit_trail":   self.analytics_service.get_summary_logs()[-10:],
        }

    def get_session_history(self, candidate_id: str, session_id: str) -> List[Dict[str, Any]]:
        """Retrieve persisted Q&A pairs for the current session from Hindsight."""
        memory = self.hindsight_service.get_candidate_context(candidate_id)
        return [
            m for m in memory["history"]
            if m.get("session_id") == session_id and m.get("category") == "Interaction"
        ]

    # ── Question generation ──────────────────────────────────────
    async def get_next_question(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.analytics_service.check_budget(limit=5.0):
            return {
                "question":   "⚠️ Session budget limit reached. Please start a new session.",
                "model":      "budget-guard",
                "difficulty": "N/A",
                "audit":      {"policy": "Budget Guard", "rationale": "Budget limit exceeded", "latency_ms": 0}
            }

        memory_context = self.hindsight_service.get_candidate_context(candidate_data["id"])
        difficulty     = await self.router.decide_route("Generate next interview question", memory_context)
        budget_status  = self.analytics_service.get_budget_status(limit=5.0)

        question_data = await self.interviewer.generate_question(
            candidate_data,
            memory_context,
            context_overrides={"budget_mode": budget_status, "difficulty": difficulty}
        )

        self.last_audit = question_data.get("audit", {})
        # Capture the memory trace for the UI "Brain Trace"
        self.last_memory_trace = {
            "weak_areas": memory_context.get("weak_areas", []),
            "strengths": memory_context.get("strengths", []),
            "session_count": memory_context.get("session_count", 0)
        }
        
        logger.info(f"Question generated | model={question_data.get('model')} | difficulty={difficulty}")
        return question_data

    # ── Response processing ──────────────────────────────────────
    async def process_response(self, candidate_id: str, question: str, response_text: str):
        try:
            safe_response = self._sanitize_input(response_text)
            
            # ── Safety Signal ────────────────────────────────────
            # If threats were filtered, notify the evaluator via context
            is_suspicious = "[FILTERED_THREAT]" in safe_response
            
            evaluation = await self.evaluator.evaluate_response(
                question, 
                safe_response
            )

            audit = evaluation.runtime_metrics.get("audit", {})
            usage = evaluation.runtime_metrics.get("usage", {"total_tokens": 0, "prompt_tokens": 0, "completion_tokens": 0})

            # Prefer actual SDK cost from CascadeFlow, fallback to manual calc
            cost = evaluation.runtime_metrics.get("total_cost")
            if not cost:
                cost = self.cascade_service.calculate_cost(
                    usage.get("prompt_tokens", 0),
                    usage.get("completion_tokens", 0),
                    evaluation.runtime_metrics.get("model", "llama-3.1-8b-instant")
                )

            self.analytics_service.log_interaction(
                model=evaluation.runtime_metrics.get("model", "unknown"),
                cost=cost,
                latency=audit.get("latency_ms", 0.0),
                tokens=usage.get("total_tokens", 0),
                session_id=self.current_session_id or "unknown",
                rationale=audit.get("rationale", "N/A"),
                savings=audit.get("savings", 0.0),
                confidence=audit.get("confidence", 1.0)
            )

            self.last_audit = audit
            self.last_audit["model"] = evaluation.runtime_metrics.get("model", "unknown")

            # ── Store interaction in Hindsight ───────────────────
            self.hindsight_service.store_memory(candidate_id, {
                "session_id": self.current_session_id,
                "question":   question,
                "response":   safe_response,
                "score":      evaluation.score,
                "category":   "Interaction"
            })

            # ── Flag weakness immediately on very low score ──────
            if evaluation.score <= 3 and evaluation.feedback:
                fb_lower = evaluation.feedback.lower()
                if not any(skip in fb_lower for skip in ["parsing failed", "degrad", "error", "safe mode"]):
                    self.hindsight_service.store_memory(candidate_id, {
                        "session_id": self.current_session_id,
                        "key_finding": evaluation.feedback[:250],
                        "category":   "Weakness"
                    })

            # ── Flag strength on very high score ─────────────────
            if evaluation.score >= 8 and evaluation.feedback:
                self.hindsight_service.store_memory(candidate_id, {
                    "session_id": self.current_session_id,
                    "key_finding": evaluation.feedback[:250],
                    "category":   "Strength"
                })

            self.session_history.append({
                "question":   question,
                "response":   safe_response,
                "evaluation": evaluation.dict()
            })

            return evaluation

        except Exception as e:
            logger.error(f"Critical error in process_response: {e}", exc_info=True)
            return None

    # ── Session end ──────────────────────────────────────────────
    async def end_session(self, candidate_data: Dict[str, Any]) -> str:
        """Finalize session: generate Hindsight reflection and flush analytics."""
        reflection = await self.memory_manager.reflect_and_update(
            candidate_data, self.session_history
        )
        self.session_history = []
        self.analytics_service.flush_to_disk()
        logger.info(f"Session {str(self.current_session_id or '')[:8]}… ended and flushed.")
        return reflection
