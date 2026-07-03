from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class Candidate(BaseModel):
    id: str
    name: str
    email: str = ""
    role: str
    experience_years: int = 0
    weak_areas: List[str] = []
    strengths: List[str] = []
    interview_count: int = 0

class MemoryEntry(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.now)
    session_id: str
    key_finding: str
    impact_score: float = 0.5
    category: str = "Technical"

class InterviewQuestion(BaseModel):
    model_config = {"protected_namespaces": ()}
    id: str
    text: str
    category: str
    difficulty: str = "Medium"
    model_used: str

class Evaluation(BaseModel):
    question_id: str
    score: int
    feedback: str
    category: str = "General"
    strengths: List[str] = []
    weaknesses: List[str] = []
    recommendations: List[str] = []
    confidence_score: float = 1.0
    latency_ms: float = 0.0
    runtime_metrics: Dict[str, Any] = {}

class SessionSummary(BaseModel):
    session_id: str
    candidate_id: str
    date: datetime = Field(default_factory=datetime.now)
    overall_score: float
    status: str = "Follow-up"
    total_savings: float = 0.0
    avg_confidence: float = 0.0
    new_weak_areas: List[str] = []
    new_strengths: List[str] = []
