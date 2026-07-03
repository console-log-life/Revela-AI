from loguru import logger
from typing import Dict, Any
import json
import re

class RouterAgent:
    """
    Gatekeeper agent that scores task complexity and routes to the optimal model tier.
    Uses a lightweight fast model to make routing decisions before the main call.
    """
    def __init__(self, cascade_service):
        self.cascade_service = cascade_service
        logger.info("RouterAgent initialized.")

    async def decide_route(self, task_description: str, candidate_history: Dict[str, Any]) -> str:
        """
        Calls the Gatekeeper LLM to score complexity.
        Returns 'easy', 'medium', or 'hard'.
        """
        policy = self.cascade_service.policy_engine.get_strategy("normal", 0.5)

        weak_areas = candidate_history.get("weak_areas", [])
        session_count = candidate_history.get("session_count", 0)

        gatekeeper_prompt = (
            f"Task: {task_description}\n"
            f"Candidate weak areas: {weak_areas}\n"
            f"Sessions completed: {session_count}\n\n"
            "Score complexity (1-10) and confidence (1-10) for this task.\n"
            'Return ONLY raw JSON (no markdown): {"complexity": <int>, "confidence": <int>, "rationale": "<str>"}'
        )

        try:
            response = await self.cascade_service.groq_service.get_completion(
                messages=[{"role": "user", "content": gatekeeper_prompt}],
                model="llama-3.1-8b-instant",
                max_tokens=120,
                temperature=0.3
            )

            content = response["content"].strip()
            # Strip any markdown fences if present
            content = re.sub(r"```(?:json)?", "", content).strip().strip("`")

            # Extract first JSON object
            match = re.search(r'\{.*?\}', content, re.DOTALL)
            if match:
                data = json.loads(match.group())
            else:
                data = json.loads(content)

            complexity = float(data.get("complexity", 5)) / 10.0
            confidence = float(data.get("confidence", 8)) / 10.0

            logger.info(f"RouterAgent: complexity={complexity:.2f}, confidence={confidence:.2f}")

            if complexity > policy.complexity_threshold or confidence < policy.min_confidence:
                logger.info("RouterAgent: Escalating to HARD (performance tier).")
                return "Hard"
            elif complexity > 0.35:
                return "Medium"
            else:
                return "Easy"

        except Exception as e:
            logger.warning(f"RouterAgent gatekeeper failed ({e}). Defaulting to Medium.")
            # Fallback based on session count heuristic
            if session_count > 2 or (weak_areas and len(weak_areas) > 2):
                return "Hard"
            return "Medium"
