import pandas as pd
from loguru import logger
import os
import json
from datetime import datetime

class AnalyticsService:
    def __init__(self):
        self.log_path = "logs/analytics.json"
        self._ensure_log_exists()
        self.buffer = []
        self.flush_threshold = 5
        logger.info("AnalyticsService initialized with async buffering.")

    def _ensure_log_exists(self):
        if not os.path.exists("logs"):
            os.makedirs("logs")
        if not os.path.exists(self.log_path):
            with open(self.log_path, "w") as f:
                json.dump([], f)

    def log_interaction(self, model: str, cost: float, latency: float, tokens: int, session_id: str, rationale: str = "", savings: float = 0.0, confidence: float = 1.0):
        """Buffer interaction logs in-memory to prevent disk I/O bottlenecks."""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "model": model,
            "cost": cost,
            "latency_ms": latency,
            "tokens": tokens,
            "session_id": session_id,
            "rationale": rationale,
            "savings": savings,
            "confidence": confidence
        }
        self.buffer.append(entry)

        if len(self.buffer) >= self.flush_threshold:
            self.flush_to_disk()

    def flush_to_disk(self):
        """Synchronize the in-memory buffer to persistent storage."""
        if not self.buffer:
            return

        try:
            with open(self.log_path, "r") as f:
                logs = json.load(f)

            logs.extend(self.buffer)
            self.buffer = []

            with open(self.log_path, "w") as f:
                json.dump(logs, f, indent=4)
            logger.debug("Analytics buffer flushed to disk.")
        except Exception as e:
            logger.error(f"Failed to flush analytics: {str(e)}")

    def check_budget(self, limit: float = 10.0) -> bool:
        """Check if the total cost is within the specified budget limit."""
        summary = self.get_summary()
        if not summary:
            return True

        current_cost = summary.get("total_cost", 0.0)
        if current_cost >= limit:
            logger.warning(f"Budget limit reached! Current: ${current_cost:.4f}, Limit: ${limit:.4f}")
            return False
        return True

    def get_budget_status(self, limit: float = 10.0) -> str:
        """Returns 'normal', 'low', or 'critical' based on remaining budget."""
        summary = self.get_summary()
        if not summary:
            return "normal"

        current_cost = summary.get("total_cost", 0.0)
        percent_used = (current_cost / limit) * 100

        if percent_used > 90:
            return "critical"
        if percent_used > 70:
            return "low"
        return "normal"

    def get_summary_logs(self):
        try:
            with open(self.log_path, "r") as f:
                return json.load(f)
        except Exception:
            return []

    def get_summary(self):
        try:
            with open(self.log_path, "r") as f:
                logs = json.load(f)

            if not logs:
                return None

            df = pd.DataFrame(logs)
            summary = {
                "total_cost": df["cost"].sum(),
                "total_savings": df["savings"].sum() if "savings" in df.columns else 0.0,
                "avg_latency": df["latency_ms"].mean() if "latency_ms" in df.columns else 0.0,
                "avg_confidence": df["confidence"].mean() if "confidence" in df.columns else 1.0,
                "total_tokens": df["tokens"].sum(),
                "model_distribution": df["model"].value_counts().to_dict(),
                "session_count": df["session_id"].nunique()
            }
            return summary
        except Exception as e:
            logger.error(f"Failed to get analytics summary: {str(e)}")
            return None
