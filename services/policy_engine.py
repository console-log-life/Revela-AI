from pydantic import BaseModel
from typing import Dict, Any, List
from loguru import logger

class RoutingPolicy(BaseModel):
    name: str
    max_latency_ms: float
    max_cost_per_query: float
    min_confidence: float
    complexity_threshold: float
    fallback_model: str

class PolicyEngine:
    """
    Systems-level policy engine for dynamic model routing.
    Decides the routing strategy based on real-time system telemetry.
    """
    def __init__(self):
        self.policies = {
            "performance": RoutingPolicy(
                name="Performance First",
                max_latency_ms=5000,
                max_cost_per_query=0.05,
                min_confidence=0.8,
                complexity_threshold=0.7,
                fallback_model="llama-3.3-70b-versatile"
            ),
            "economy": RoutingPolicy(
                name="Budget Velocity Control",
                max_latency_ms=2000,
                max_cost_per_query=0.005,
                min_confidence=0.5,
                complexity_threshold=0.4,
                fallback_model="llama-3.1-8b-instant"
            )
        }
        logger.info("PolicyEngine initialized with Performance and Economy policies.")

    def get_strategy(self, budget_status: str, task_complexity: float) -> RoutingPolicy:
        """Dynamically select a routing policy based on system state."""
        if budget_status in ["low", "critical"] or task_complexity < 0.4:
            logger.info("PolicyEngine: Selecting ECONOMY strategy.")
            return self.policies["economy"]

        logger.info("PolicyEngine: Selecting PERFORMANCE strategy.")
        return self.policies["performance"]
