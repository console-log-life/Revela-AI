from loguru import logger
import os
import json
from models.schemas import Evaluation

class EvaluatorAgent:
    def __init__(self, cascade_service):
        self.cascade_service = cascade_service
        self.prompt_template = self._load_prompt()

    def _load_prompt(self):
        prompt_path = "prompts/evaluator_prompt.txt"
        if os.path.exists(prompt_path):
            with open(prompt_path, "r") as f:
                return f.read()
        return "Evaluate this response: {response} for question {question}."

    async def evaluate_response(self, question: str, response_text: str) -> Evaluation:
        """Evaluate the candidate's response and return a validated Pydantic model."""
        prompt = self.prompt_template.format(
            question=question,
            response=response_text
        )

        logger.info("Evaluating candidate response...")

        result = await self.cascade_service.route_and_execute(
            prompt=prompt,
            difficulty="Medium",
            context={"system_prompt": "You are a technical evaluator. Return only valid JSON."}
        )

        # Defensive check for result structure
        if not result or not isinstance(result, dict):
            logger.error("Cascade service returned invalid result type.")
            return self._error_evaluation("Invalid service response", {})

        try:
            content = result.get("content", "").strip()
            if not content:
                raise ValueError("Empty content in result")

            # Robust JSON extraction
            data = self._extract_json(content)

            raw_score = data.get("score", 5)
            if isinstance(raw_score, dict):
                score_val = raw_score.get("technical_accuracy", 5)
            else:
                try:
                    score_val = int(raw_score)
                except (ValueError, TypeError):
                    score_val = 5

            strengths_text = data.get("strengths", "")
            weaknesses_text = data.get("weaknesses", "")

            recommendations = []
            if weaknesses_text:
                recommendations.append(f"Review and improve: {weaknesses_text}")
            if score_val < 7:
                recommendations.append("Use a clearer structure: solution, trade-offs, risks, and validation.")
            else:
                recommendations.append("Push deeper into edge cases and production trade-offs on the next round.")

            return Evaluation(
                question_id="current",
                score=score_val,
                feedback=data.get("key_finding", data.get("feedback", "No feedback")),
                category=data.get("category", "General"),
                strengths=self._normalize_points(strengths_text),
                weaknesses=self._normalize_points(weaknesses_text),
                recommendations=recommendations,
                confidence_score=result.get("audit", {}).get("confidence", 1.0),
                latency_ms=result.get("audit", {}).get("latency_ms", 0.0),
                runtime_metrics={
                    "model": result.get("model", "unknown"),
                    "audit": result.get("audit", {}),
                    "usage": result.get("usage", {"total_tokens": 0}),
                    "total_cost": result.get("total_cost", 0.0)
                }
            )
        except Exception as e:
            logger.error(f"Validation Error: {str(e)}")
            return self._error_evaluation(str(e), result)

    def _error_evaluation(self, error_msg: str, result: dict) -> Evaluation:
        """Safe fallback for evaluation failures."""
        # Ensure we don't crash while trying to report a crash
        raw_content = result.get("content", "N/A") if isinstance(result, dict) else "N/A"
        return Evaluation(
            question_id="error",
            score=3,
            feedback=f"Evaluator parsing failed: {error_msg}. Raw snippet: {str(raw_content)[:100]}",
            category="General",
            strengths=[],
            weaknesses=["The evaluator could not safely parse this response."],
            recommendations=["Retry the evaluation or review the raw model output."],
            confidence_score=result.get("audit", {}).get("confidence", 0) if isinstance(result, dict) else 0,
            latency_ms=result.get("audit", {}).get("latency_ms", 0) if isinstance(result, dict) else 0,
            runtime_metrics={
                "model": result.get("model", "unknown") if isinstance(result, dict) else "unknown",
                "audit": result.get("audit", {}) if isinstance(result, dict) else {},
                "usage": result.get("usage", {}) if isinstance(result, dict) else {}
            }
        )

    def _extract_json(self, text: str) -> dict:
        """Robustly extract JSON from text, handling markdown blocks and noise."""
        import re
        
        # Try to find content within triple backticks first
        json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        # Fallback: Find the first { and last }
        start = text.find('{')
        end = text.rfind('}')
        
        if start != -1 and end != -1 and end > start:
            for i in range(end, start, -1):
                try:
                    return json.loads(text[start:i+1])
                except json.JSONDecodeError:
                    continue

        raise ValueError("No valid JSON object found in response")

    def _normalize_points(self, text: str):
        if not text:
            return []
        points = [segment.strip() for segment in str(text).replace("\n", " ").split(".") if segment.strip()]
        if not points:
            points = [str(text).strip()]
        return points[:3]
