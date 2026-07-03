import time
import uuid
import asyncio
from loguru import logger
from typing import Dict, Any
from services.policy_engine import PolicyEngine
try:
    from cascadeflow import CascadeAgent, ModelConfig
    CASCADE_AVAILABLE = True
except ImportError:
    CASCADE_AVAILABLE = False

class CascadeService:
    def __init__(self, groq_service):
        self.groq_service = groq_service
        self.policy_engine = PolicyEngine()
        self.models = {
            "efficiency":  "llama-3.1-8b-instant",
            "performance": "llama-3.3-70b-versatile",
            "free":        "gemma2-9b-it"
        }
        self.failure_count = 0
        self.circuit_open = False
        self.simulate_failure = False
        self.last_failure_time = 0
        self.BREAKER_THRESHOLD = 3
        self.COOLDOWN_PERIOD = 30

        self.cache: Dict[str, Any] = {}
        self.CACHE_TTL = 600

        self.latency_history = []
        self.MAX_ROLLING_LATENCY = 2500

        from services.failover_service import FailoverService
        self.failover_service = FailoverService(self.groq_service)

        if CASCADE_AVAILABLE:
            self.cascade_agent = CascadeAgent(models=[
                ModelConfig(name=self.models["efficiency"], provider="groq"),
                ModelConfig(name=self.models["performance"], provider="groq")
            ])
            logger.info(f"CascadeService using official cascadeflow engine.")
        else:
            logger.info("CascadeService using manual routing logic.")

    # ── Cost tables (Groq pricing, per 1M tokens) ─────────────────
    _COST_RATES = {
        "llama-3.1-8b-instant":    {"prompt": 0.05,  "completion": 0.08},
        "llama-3.3-70b-versatile": {"prompt": 0.59,  "completion": 0.79},
        "gemma2-9b-it":            {"prompt": 0.20,  "completion": 0.20},
        "llama3-8b-8192":          {"prompt": 0.05,  "completion": 0.08},
        "mixtral-8x7b-32768":      {"prompt": 0.24,  "completion": 0.24},
    }
    # GPT-4o baseline for savings calculation ($15/1M tokens)
    _BASELINE_RATE = 15.0

    async def route_and_execute(self, prompt: str, difficulty: str = "Medium", context: Dict[str, Any] = None):
        """Policy-driven routing with TTL Caching, Latency Awareness, and Failover."""
        if context is None:
            context = {}

        trace_id  = str(uuid.uuid4())
        start_time = time.time()

        cache_key = f"{difficulty}_{prompt[:50]}"
        if cache_key in self.cache:
            entry, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.CACHE_TTL:
                logger.info(f"TRACE[{trace_id[:8]}]: Cache HIT")
                return entry
            del self.cache[cache_key]

        budget_status = context.get("budget_mode", "normal")
        confidence    = context.get("confidence", 1.0)

        # ── Chaos engineering hook ────────────────────────────────
        if self.simulate_failure:
            self.circuit_open = True
            self.last_failure_time = time.time()
            logger.warning(f"TRACE[{trace_id[:8]}]: SIMULATED FAILURE — circuit tripped.")
            return self._safe_mode_response("Simulated Provider Outage")

        # ── Circuit breaker auto-recovery ─────────────────────────
        if self.circuit_open:
            if time.time() - self.last_failure_time > self.COOLDOWN_PERIOD:
                self.circuit_open = False
                self.failure_count = 0
                logger.info(f"TRACE[{trace_id[:8]}]: Circuit CLOSED after cooldown.")
            else:
                logger.warning(f"TRACE[{trace_id[:8]}]: Circuit OPEN — safe-mode response.")
                return self._safe_mode_response("Circuit Breaker Active")

        # ── Policy-driven model selection ─────────────────────────
        policy = self.policy_engine.get_strategy(budget_status, 0.5)
        avg_latency = sum(self.latency_history[-5:]) / 5 if len(self.latency_history) >= 5 else 0
        latency_degraded = avg_latency > policy.max_latency_ms

        if budget_status == "critical" or latency_degraded:
            model_to_use = self.models["free"]
            rationale    = "Safety/Latency Degradation — Economy Fallback" if latency_degraded else "Budget Critical — Economy Fallback"
        elif difficulty.lower() == "hard" or confidence < policy.min_confidence:
            model_to_use = self.models["performance"]
            rationale    = f"Performance Escalation (conf={confidence:.2f}, diff={difficulty})"
        else:
            model_to_use = self.models["efficiency"]
            rationale    = f"Efficiency Routing (policy={policy.name})"

        try:
            logger.info(f"TRACE[{trace_id[:8]}]: {model_to_use} | {rationale}")
            
            if CASCADE_AVAILABLE and not self.simulate_failure:
                # Use the official CascadeFlow agent for routing
                result = await self.cascade_agent.run(prompt)
                content = result.content
                model_used = result.model_used
                actual_cost = result.total_cost
                # Capture usage if provided by SDK
                usage = getattr(result, "usage", {"total_tokens": 0, "prompt_tokens": 0, "completion_tokens": 0})
                logger.info(f"TRACE[{trace_id[:8]}]: cascadeflow used {model_used}")
            else:
                # Manual fallback
                response = await self.groq_service.get_completion(
                    messages=[{"role": "user", "content": prompt}],
                    model=model_to_use
                )
                content = response["content"]
                model_used = response.get("model", model_to_use)
                usage = response.get("usage", {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0})
                actual_cost = self.calculate_cost(usage["prompt_tokens"], usage["completion_tokens"], model_used)
            
            self.failure_count = 0

        except Exception as e:
            logger.warning(f"TRACE[{trace_id[:8]}]: Primary failed ({e}). Activating failover…")
            response = await self.failover_service.execute_with_fallback(
                messages=[{"role": "user", "content": prompt}],
                model=self.models["free"]
            )
            content = response["content"]
            model_used = response.get("model", self.models["free"])
            usage = response.get("usage", {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0})
            actual_cost = self.calculate_cost(usage["prompt_tokens"], usage["completion_tokens"], model_used)
            rationale += " [FAILOVER ACTIVE]"
            self.failure_count += 1
            if self.failure_count >= self.BREAKER_THRESHOLD:
                self.circuit_open = True
                self.last_failure_time = time.time()
                logger.error(f"TRACE[{trace_id[:8]}]: Circuit OPENED after {self.failure_count} failures.")

        latency_ms = (time.time() - start_time) * 1000
        self.latency_history.append(latency_ms)

        # ── Accurate Tokenomics ──────────────────────────────────
        # Extract actual usage if available, otherwise fallback to character-based heuristic (4 chars ~ 1 token)
        actual_usage = usage if 'usage' in locals() else {"total_tokens": 0, "prompt_tokens": 0, "completion_tokens": 0}
        
        prompt_tokens = actual_usage.get("prompt_tokens", 0)
        completion_tokens = actual_usage.get("completion_tokens", 0)
        
        if prompt_tokens == 0:
            prompt_tokens = len(prompt) // 4
        if completion_tokens == 0:
            completion_tokens = len(content) // 4
            
        total_tokens = prompt_tokens + completion_tokens

        # Baseline calculation using the SAME token counts for fairness
        base_cost = self.calculate_baseline_cost(prompt_tokens, completion_tokens)
        savings = max(0.0, base_cost - actual_cost)

        response = {
            "content": content,
            "model": model_used,
            "usage": {
                "total_tokens": total_tokens,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens
            },
            "total_cost": actual_cost,
            "audit": {
                "trace_id":      trace_id,
                "rationale":     rationale,
                "latency_ms":    latency_ms,
                "savings":       savings,
                "confidence":    confidence,
                "circuit_status": "OPEN" if self.circuit_open else "CLOSED",
                "policy":        policy.name,
                "model":         model_used,
                "actual_cost":   actual_cost
            }
        }

        if model_used != "safe-mode":
            self.cache[cache_key] = (response, time.time())

        return response

    def _safe_mode_response(self, rationale: str) -> Dict[str, Any]:
        return {
            "content": "System is in degraded mode due to provider instability. Please try again in a few moments.",
            "usage":  {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
            "total_cost": 0.0,
            "model":  "safe-mode",
            "audit":  {
                "trace_id":      str(uuid.uuid4()),
                "rationale":     f"{rationale} [Safe Mode Active]",
                "latency_ms":    0,
                "savings":       0,
                "confidence":    0,
                "circuit_status": "OPEN",
                "policy":        "Safety Mode",
                "model":         "safe-mode",
                "actual_cost":   0.0
            }
        }

    def calculate_baseline_cost(self, prompt_tokens: int, completion_tokens: int) -> float:
        """GPT-4o equivalent baseline cost — $15/1M tokens."""
        return (prompt_tokens + completion_tokens) * self._BASELINE_RATE / 1_000_000

    def calculate_cost(self, prompt_tokens: int, completion_tokens: int, model: str) -> float:
        """Estimate actual Groq cost for the given model."""
        rate = self._COST_RATES.get(model, self._COST_RATES["llama-3.1-8b-instant"])
        return (prompt_tokens * rate["prompt"] + completion_tokens * rate["completion"]) / 1_000_000
