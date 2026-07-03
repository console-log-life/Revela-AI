import asyncio
import pytest
from unittest.mock import MagicMock, AsyncMock
from agents.evaluator import EvaluatorAgent

@pytest.mark.asyncio
async def test_evaluator_robustness():
    """Verify that the EvaluatorAgent handles malformed or missing LLM responses safely."""
    # Mock CascadeService
    mock_cascade = MagicMock()
    mock_cascade.route_and_execute = AsyncMock()
    
    agent = EvaluatorAgent(mock_cascade)
    
    # 1. Test malformed JSON (mixed quotes and noise)
    mock_cascade.route_and_execute.return_value = {
        "content": "Result: { \"score\": 8, \"feedback\": \"Good\" } extra noise",
        "model": "test-model",
        "audit": {"confidence": 0.9, "latency_ms": 100},
        "usage": {"total_tokens": 50},
        "total_cost": 0.01
    }
    
    eval1 = await agent.evaluate_response("Q", "A")
    assert eval1.score == 8
    
    # 2. Test missing content key (The 'Poison Pill' scenario)
    mock_cascade.route_and_execute.return_value = {"error": "Internal failure"}
    
    eval2 = await agent.evaluate_response("Q", "A")
    assert eval2.score == 3
    assert "parsing failed" in eval2.feedback.lower()
    
    # 3. Test Markdown wrapped JSON
    mock_cascade.route_and_execute.return_value = {
        "content": "Sure! \n```json\n{\"score\": 10, \"key_finding\": \"Perfect\"}\n```",
        "model": "test-model"
    }
    
    eval3 = await agent.evaluate_response("Q", "A")
    assert eval3.score == 10
