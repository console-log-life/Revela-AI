import pytest
import asyncio
from unittest.mock import MagicMock, AsyncMock
from services.cascade_service import CascadeService
from services.groq_service import GroqService

@pytest.fixture
def mock_groq():
 service = MagicMock(spec=GroqService)
 service.get_completion = AsyncMock()
 return service

@pytest.mark.asyncio
async def test_circuit_breaker_trips(mock_groq):
"""
 Verify that the circuit breaker trips after BREAKER_THRESHOLD failures.
"""
 cascade = CascadeService(mock_groq)
 # Simulate 3 failures
 mock_groq.get_completion.side_effect = Exception("API Down")
 
 # First 3 attempts should try to call the service
 for _ in range(3):
 await cascade.route_and_execute("test prompt")
 
 assert cascade.failure_count == 3
 assert cascade.circuit_open is True
 
 # 4th attempt should hit the breaker immediately (return safe mode)
 response = await cascade.route_and_execute("test prompt")
 assert response["model"] =="safe-mode"
 assert"Circuit Breaker Tripped"in response["audit"]["rationale"]

@pytest.mark.asyncio
async def test_failover_logic(mock_groq):
"""
 Verify that failure in primary triggers the FailoverService (Mixtral fallback).
"""
 cascade = CascadeService(mock_groq)
 
 # Primary fails, but fallback succeeds
 mock_groq.get_completion.side_effect = [
 Exception("Primary Down"),
 {"content":"Fallback success","model":"mixtral-8x7b-32768","usage": {"total_tokens": 10,"prompt_tokens": 5,"completion_tokens": 5}}
 ]
 
 response = await cascade.route_and_execute("test prompt")
 
 assert response["model"] =="mixtral-8x7b-32768"
 assert"[FAILOVER ACTIVE: Mixtral]"in response["audit"]["rationale"]
 assert cascade.failure_count == 1 # Tracked but session saved

def test_policy_selection():
"""
 Verify the PolicyEngine selects correct strategies based on budget/complexity.
"""
 from services.policy_engine import PolicyEngine
 engine = PolicyEngine()
 
 # Critical budget should trigger Economy
 policy = engine.get_strategy("critical", 0.9)
 assert policy.name =="Budget Velocity Control"
 assert policy.max_latency_ms == 2000
 
 # Healthy budget + High complexity should trigger Performance
 policy = engine.get_strategy("normal", 0.8)
 assert policy.name =="Performance First"

@pytest.mark.asyncio
async def test_cache_ttl_logic(mock_groq):
"""
 Verify TTL caching prevents redundant calls.
"""
 cascade = CascadeService(mock_groq)
 mock_groq.get_completion.return_value = {
"content":"cached result", 
"model":"qwen-32b-preview", 
"usage": {"total_tokens": 10,"prompt_tokens": 5,"completion_tokens": 5}
 }
 
 # First call: Cache miss
 await cascade.route_and_execute("cached prompt")
 assert mock_groq.get_completion.call_count == 1
 
 # Second call within TTL: Cache hit
 await cascade.route_and_execute("cached prompt")
 assert mock_groq.get_completion.call_count == 1
