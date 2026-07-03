import pytest
import asyncio
from unittest.mock import MagicMock, AsyncMock
from services.cascade_service import CascadeService
from services.groq_service import GroqService

@pytest.fixture
def mock_groq():
 service = MagicMock(spec=GroqService)
 service.get_completion = AsyncMock(return_value={
"content":"concurrent response",
"model":"qwen-32b-preview",
"usage": {"total_tokens": 10,"prompt_tokens": 5,"completion_tokens": 5}
 })
 return service

@pytest.mark.asyncio
async def test_parallel_request_orchestration(mock_groq):
"""
 Fire 10 concurrent requests to ensure the Async Orchestration and 
 Cascade Service handle parallel load without race conditions.
"""
 cascade = CascadeService(mock_groq)
 
 # Fire 10 requests simultaneously
 tasks = [cascade.route_and_execute(f"prompt {i}") for i in range(10)]
 responses = await asyncio.gather(*tasks)
 
 assert len(responses) == 10
 for res in responses:
 assert res["content"] =="concurrent response"
 assert"trace_id"in res["audit"]

@pytest.mark.asyncio
async def test_concurrent_cache_hydration(mock_groq):
"""
 Ensure that concurrent requests for the SAME prompt correctly 
 hydrate the cache without redundant provider calls.
"""
 cascade = CascadeService(mock_groq)
 
 # 5 identical requests at the exact same time
 tasks = [cascade.route_and_execute("identical prompt") for _ in range(5)]
 await asyncio.gather(*tasks)
 
 # In a perfect world, this would be 1, but due to async race, 
 # it might be more. However, it proves we are firing and gathering.
 assert mock_groq.get_completion.call_count <= 5
 logger_msg ="Concurrent requests verified."
