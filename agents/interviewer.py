from loguru import logger
import os
import uuid
from typing import Dict, Any

class InterviewerAgent:
    def __init__(self, cascade_service):
        self.cascade_service = cascade_service
        self.prompt_template = self._load_prompt()

    def _load_prompt(self):
        prompt_path = "prompts/interviewer_prompt.txt"
        if os.path.exists(prompt_path):
            with open(prompt_path, "r") as f:
                return f.read()
        return "You are an interviewer. Ask a technical question for {role}."

    async def generate_question(self, candidate_data: Dict[str, Any], memory_context: Dict[str, Any], context_overrides: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate the next interview question asynchronously."""
        prompt = self.prompt_template.format(
            role=candidate_data["role"],
            name=candidate_data["name"],
            session_count=memory_context["session_count"] + 1,
            weak_areas=",".join(memory_context["weak_areas"]),
            strengths=",".join(memory_context["strengths"])
        )

        prompt += f"\n\n[Request ID: {uuid.uuid4()}]"

        logger.info(f"Generating question for {candidate_data['name']}...")

        routing_context = context_overrides if context_overrides else {}

        result = await self.cascade_service.route_and_execute(
            prompt=prompt,
            difficulty=routing_context.get("difficulty", "Medium"),
            context=routing_context
        )

        return {
            "question": result["content"],
            "model": result["model"],
            "difficulty": routing_context.get("difficulty", "Medium"),
            "audit": result.get("audit", {})
        }
