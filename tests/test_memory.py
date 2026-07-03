import pytest
from services.hindsight_service import HindsightService
import os
import json

@pytest.fixture
def hindsight_service():
    test_path = "data/test_memory.json"
    if os.path.exists(test_path):
        os.remove(test_path)
    service = HindsightService(storage_path=test_path)
    yield service
    # Cleanup after tests
    if os.path.exists(test_path):
        os.remove(test_path)

def test_memory_persistence(hindsight_service):
    candidate_id = "test_user_123"
    entry = {
        "session_id": "session_001",
        "key_finding": "Struggles with recursion",
        "category": "Weakness"
    }
    
    hindsight_service.store_memory(candidate_id, entry)
    # Add a reflection to increment session count
    hindsight_service.store_memory(candidate_id, {
        "session_id": "session_001", 
        "category": "Reflection", 
        "key_finding": "Final summary"
    })
    
    context = hindsight_service.get_candidate_context(candidate_id)
    assert "Struggles with recursion" in context["weak_areas"]
    assert context["session_count"] == 1

def test_memory_aggregation(hindsight_service):
    candidate_id = "test_user_456"
    
    hindsight_service.store_memory(candidate_id, {
        "session_id": "s1", "key_finding": "Python expert", "category": "Strength"
    })
    hindsight_service.store_memory(candidate_id, {
        "session_id": "s2", "key_finding": "Weak in SQL", "category": "Weakness"
    })
    # Add reflections
    hindsight_service.store_memory(candidate_id, {"session_id": "s1", "category": "Reflection", "key_finding": "Ref 1"})
    hindsight_service.store_memory(candidate_id, {"session_id": "s2", "category": "Reflection", "key_finding": "Ref 2"})
    
    context = hindsight_service.get_candidate_context(candidate_id)
    assert "Python expert" in context["strengths"]
    assert "Weak in SQL" in context["weak_areas"]
    assert context["session_count"] == 2
