from loguru import logger
import os
import json
import re
from typing import Dict, Any, List

class MemoryManagerAgent:
    """
    Analyzes session history and updates the candidate's long-term Hindsight profile.
    Extracts structured weak areas and strengths from the reflection.
    """
    def __init__(self, hindsight_service, cascade_service):
        self.hindsight_service = hindsight_service
        self.cascade_service   = cascade_service
        self.prompt_template   = self._load_prompt()

    def _load_prompt(self):
        prompt_path = "prompts/memory_reflection_prompt.txt"
        if os.path.exists(prompt_path):
            with open(prompt_path, "r") as f:
                return f.read()
        return "Reflect on this history: {history} for candidate {name}."

    async def reflect_and_update(self, candidate_data: Dict[str, Any], session_history: List[Dict[str, Any]]) -> str:
        """Analyze session and persist structured memory to Hindsight storage."""
        if not session_history:
            return "No history to analyze for this session."

        prompt = self.prompt_template.format(
            name=candidate_data["name"],
            history=json.dumps(session_history, indent=2, default=str)
        )

        logger.info(f"Generating trajectory reflection for {candidate_data['name']}…")

        reflection = await self.cascade_service.route_and_execute(
            prompt=prompt,
            difficulty="Hard",
            context={"system_prompt": "You are a senior talent architect."}
        )

        content = reflection.get("content") if isinstance(reflection, dict) else reflection
        if content is None:
            content = "Reflection generation did not return usable text."
        if not isinstance(content, str):
            content = str(content)

        # ── Persist the full reflection entry ───────────────────
        self.hindsight_service.store_memory(
            candidate_id=candidate_data["id"],
            entry={
                "session_id":      candidate_data.get("session_id", "unknown"),
                "key_finding":     f"Session Reflection: {content[:150]}…",
                "category":        "Reflection",
                "full_reflection": content
            }
        )

        # ── Extract structured weak areas ────────────────────────
        weak_areas = self._extract_bullets(content, [
            "Refined Weak Areas", "Weak Areas", "Weaknesses"
        ])
        for w in weak_areas:
            self.hindsight_service.store_memory(
                candidate_id=candidate_data["id"],
                entry={
                    "session_id": candidate_data.get("session_id", "unknown"),
                    "key_finding": w,
                    "category":   "Weakness"
                }
            )

        # ── Extract structured strengths ─────────────────────────
        strengths = self._extract_bullets(content, [
            "Confirmed Strengths", "Strengths"
        ])
        for s in strengths:
            self.hindsight_service.store_memory(
                candidate_id=candidate_data["id"],
                entry={
                    "session_id": candidate_data.get("session_id", "unknown"),
                    "key_finding": s,
                    "category":   "Strength"
                }
            )

        logger.info(f"Stored reflection + {len(weak_areas)} weak areas + {len(strengths)} strengths for {candidate_data['name']}")
        return content

    def _extract_bullets(self, text: str, section_headers: List[str]) -> List[str]:
        """
        Find a named section in the reflection and extract its bullet points.
        Handles both '- item' and '* item' formats.
        """
        for header in section_headers:
            # Look for the section header (case-insensitive, handles ##/### prefix)
            pattern = rf'(?:#{1,3}\s*)?{re.escape(header)}[^\n]*\n(.*?)(?=\n#{1,3}|\Z)'
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                block = match.group(1)
                if not block or not isinstance(block, str):
                    continue
                bullets = re.findall(r'[-*•]\s+(.+)', block)
                # Clean and filter out noise
                cleaned = []
                for b in bullets:
                    b = b.strip()
                    if len(b) > 10 and not any(skip in b.lower() for skip in ["n/a", "none", "n/a"]):
                        cleaned.append(b[:250])
                if cleaned:
                    return cleaned
        return []
