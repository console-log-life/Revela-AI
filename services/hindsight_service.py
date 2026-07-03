import os
from pathlib import Path
from loguru import logger
from typing import List, Dict, Any
from datetime import datetime
import json
import portalocker
import nest_asyncio
nest_asyncio.apply()
try:
    from hindsight_client import Hindsight
    HINDSIGHT_AVAILABLE = True
except ImportError:
    HINDSIGHT_AVAILABLE = False

class HindsightService:
    """
    Service for persistent cross-session memory management.
    In a real-world scenario, this would interface with a vector DB or Hindsight API.
    For this implementation, we use structured local storage to demonstrate the concept.
    """
    def __init__(self, storage_path="data/memory.json"):
        root_dir = Path(__file__).resolve().parent.parent
        if isinstance(storage_path, str):
            storage_path = root_dir / storage_path

        self.storage_path = str(storage_path)
        self._ensure_storage_exists()
        
        self.url = os.getenv("HINDSIGHT_URL", "https://api.hindsight.vectorize.io")
        self.api_key = os.getenv("HINDSIGHT_API_KEY")
        self.use_cloud = HINDSIGHT_AVAILABLE and self.api_key and "your_hindsight_api_key_here" not in self.api_key
        
        if self.use_cloud:
            try:
                self.client = Hindsight(base_url=self.url, api_key=self.api_key)
                logger.info(f"HindsightService connected to Cloud at {self.url}")
            except Exception as e:
                logger.warning(f"Failed to connect to Hindsight Cloud: {e}. Falling back to local.")
                self.use_cloud = False
        else:
            logger.info(f"HindsightService using local storage at {storage_path}")

    def _ensure_storage_exists(self):
        os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
        if not os.path.exists(self.storage_path):
            with open(self.storage_path, "w") as f:
                json.dump({}, f)

    def store_memory(self, candidate_id: str, entry: Dict[str, Any]):
        """Store a new memory entry for a candidate."""
        local_entry = dict(entry)
        if self.use_cloud:
            try:
                # Use Hindsight's 'retain' operation
                self.client.retain(
                    bank_id=candidate_id,
                    content=entry.get("key_finding", "") or entry.get("response", ""),
                    context=entry.get("category", "General"),
                    metadata=entry
                )
                logger.info(f"Hindsight Cloud: Retained memory for {candidate_id}")
                # Keep local history in sync for UI timelines and session analytics.
                self._store_local(candidate_id, local_entry)
            except Exception as e:
                logger.error(f"Hindsight Cloud Retain Error: {e}")
                # Fallback to local
                self._store_local(candidate_id, local_entry)
        else:
            self._store_local(candidate_id, local_entry)

    def _store_local(self, candidate_id: str, entry: Dict[str, Any]):
        try:
            with portalocker.Lock(self.storage_path, "r+", timeout=10) as fh:
                memory = json.load(fh)
                if candidate_id not in memory:
                    memory[candidate_id] = []
                entry["timestamp"] = datetime.now().isoformat()
                memory[candidate_id].append(entry)
                fh.seek(0)
                fh.truncate()
                json.dump(memory, fh, indent=4)
            logger.info(f"Stored local memory for {candidate_id}: {entry.get('key_finding')}")
        except Exception as e:
            logger.error(f"Failed to store local memory: {str(e)}")

    def get_candidate_context(self, candidate_id: str) -> Dict[str, Any]:
        history = self._get_local_history(candidate_id)
        if self.use_cloud:
            try:
                results = self.client.recall(
                    bank_id=candidate_id,
                    query="What are the candidate's current strengths and weaknesses?"
                )
                cloud_texts = []
                for item in results:
                    if hasattr(item, "content"):
                        cloud_texts.append(item.content)
                    elif isinstance(item, dict):
                        cloud_texts.append(item.get("content", ""))
                    else:
                        cloud_texts.append(str(item))

                weak_areas = [text for text in cloud_texts if "weak" in text.lower()]
                strengths = [text for text in cloud_texts if "strength" in text.lower()]

                return {
                    "history": history,
                    "weak_areas": weak_areas or self._extract_strengths_and_weaknesses(history, "weak"),
                    "strengths": strengths or self._extract_strengths_and_weaknesses(history, "strength"),
                    "session_count": len([h for h in history if h.get("category") == "Reflection"])
                }
            except Exception as e:
                logger.error(f"Hindsight Cloud Recall Error: {e}")

        return self._get_local_context(candidate_id)

    def _get_local_history(self, candidate_id: str) -> List[Dict[str, Any]]:
        try:
            with open(self.storage_path, "r") as f:
                memory = json.load(f)
            return memory.get(candidate_id, [])
        except:
            return []

    def _extract_strengths_and_weaknesses(self, history: List[Dict[str, Any]], keyword: str) -> List[str]:
        values = []
        for item in history:
            if item.get("category") in {"Strength", "Weakness", "Reflection"}:
                text = item.get("key_finding", "") or item.get("full_reflection", "")
                if keyword in text.lower():
                    values.append(text)
        return list({value for value in values if value})

    def _get_local_context(self, candidate_id: str) -> Dict[str, Any]:
        try:
            candidate_memory = self._get_local_history(candidate_id)
            def is_valid_finding(text):
                if not text: return False
                text_lower = text.lower()
                invalid_phrases = ["parsing failed", "degrad", "critical", "error", "safe mode"]
                return not any(phrase in text_lower for phrase in invalid_phrases)

            weak_areas = [m.get("key_finding", "") for m in candidate_memory if m.get("category") == "Weakness" and is_valid_finding(m.get("key_finding"))]
            strengths = [m.get("key_finding", "") for m in candidate_memory if m.get("category") == "Strength" and is_valid_finding(m.get("key_finding"))]

            completed_sessions = len([m for m in candidate_memory if m.get("category") == "Reflection"])

            return {
                "history": candidate_memory,
                "weak_areas": list(set([w for w in weak_areas if w])),
                "strengths": list(set([s for s in strengths if s])),
                "session_count": completed_sessions
            }
        except Exception as e:
            logger.error(f"Failed to retrieve candidate context: {str(e)}")
            return {"history": [], "weak_areas": [], "strengths": [], "session_count": 0}

    def clear_memory(self, candidate_id: str):
        """Clear memory for a specific candidate (useful for testing)."""
        try:
            with open(self.storage_path, "r") as f:
                memory = json.load(f)

            if candidate_id in memory:
                del memory[candidate_id]
                with open(self.storage_path, "w") as f:
                    json.dump(memory, f, indent=4)
            logger.info(f"Cleared memory for candidate {candidate_id}")
        except Exception as e:
            logger.error(f"Failed to clear memory: {str(e)}")
