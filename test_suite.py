import os
import pytest
from unittest.mock import MagicMock, patch
from logic import StadiumAgents

# --- Security & Config Tests ---

def test_security_api_key_mandate():
    """Verifies that the system raises an error if the API Key is missing."""
    with patch.dict(os.environ, {}, clear=True):
        with pytest.raises(ValueError, match="API Key is mandatory"):
            StadiumAgents()

# --- Fan Concierge Tests ---

@patch("google.generativeai.GenerativeModel.generate_content")
def test_fan_concierge_success(mock_generate, stadium_agents):
    """Tests successful conversational path for a fan query."""
    mock_response = MagicMock()
    mock_response.text = "The shortest wait is at Gate A (5 mins)."
    mock_generate.return_value = mock_response

    query = "Where should I exit?"
    telemetry = {"Gate A": 10, "Gate B": 90}
    
    result = stadium_agents.get_fan_advice(query, telemetry)
    
    assert "Gate A" in result
    mock_generate.assert_called_once()

@patch("google.generativeai.GenerativeModel.generate_content")
def test_fan_concierge_api_failure(mock_generate, stadium_agents):
    """Tests resilience when the Gemini API returns a 500 error or timeout."""
    mock_generate.side_effect = Exception("API Timeout")
    
    result = stadium_agents.get_fan_advice("Help", {})
    
    assert "trouble connecting" in result

# --- Staff Dashboard Tests ---

@patch("google.generativeai.GenerativeModel.generate_content")
def test_staff_summary_logic(mock_generate, stadium_agents):
    """Verifies that telemetry data triggers valid staff assessments."""
    mock_response = MagicMock()
    mock_response.text = "ALERT: Bottleneck at Gate B."
    mock_generate.return_value = mock_response

    telemetry = {"Gate B": 95}
    result = stadium_agents.get_staff_summary(telemetry)
    
    assert "ALERT" in result

# --- Fixtures ---

@pytest.fixture
def stadium_agents():
    """Provides a StadiumAgents instance with a mock key."""
    with patch.dict(os.environ, {"GEMINI_API_KEY": "test_key"}):
        return StadiumAgents()
