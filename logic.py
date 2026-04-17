import os
import json
import logging
import google.generativeai as genai
from typing import Dict, Any, Optional

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StadiumAgents:
    """
    Elite multi-agent system for stadium coordination and fan interaction.
    
    Attributes:
        api_key (str): The Google API Key retrieved from environment variables.
    """

    def __init__(self, api_key: Optional[str] = None) -> None:
        """
        Initializes the agentic system with Gemini 1.5 Pro.

        Args:
            api_key: Optional API key. If not provided, retrieves from os.getenv.

        Raises:
            ValueError: If no API key is found in environment or arguments.
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.error("GEMINI_API_KEY not found in environment.")
            raise ValueError("API Key is mandatory for StadiumAgents.")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-pro')

    def get_fan_advice(self, query: str, telemetry: Dict[str, Any]) -> str:
        """
        Processes fan requests via the Fan Interaction Agent.

        Args:
            query: The natural language request from the fan.
            telemetry: A dictionary containing real-time venue status.

        Returns:
            A string containing professional, context-aware advice.
        """
        system_instruction = (
            "You are the 'StadiumFlow Fan Concierge'. Your goal is to improve attendee experience "
            "by providing fast, conversational navigation and logistics help. "
            f"Context: {json.dumps(telemetry)}. Always mention estimated waiting times."
        )
        
        try:
            response = self.model.generate_content(
                f"System: {system_instruction}\nUser: {query}"
            )
            return response.text
        except Exception as e:
            logger.error(f"Error in Fan Agent: {e}")
            return "I'm having trouble connecting to venue intelligence. Please follow physical signage."

    def get_staff_summary(self, telemetry: Dict[str, Any]) -> str:
        """
        Analyzes venue telemetry via the Venue Telemetry Agent.

        Args:
            telemetry: Real-time sensor data dictionary.

        Returns:
            A high-level assessment of bottlenecks and coordination needs.
        """
        system_instruction = (
            "You are the 'StadiumFlow Venue Telemetry Agent'. Analyze the data for "
            "bottlenecks and crowd movement anomalies. Be concise and authoritative."
        )

        prompt = f"Analyze this telemetry: {json.dumps(telemetry)}. Identify 3 critical coordination points."

        try:
            response = self.model.generate_content(
                f"System: {system_instruction}\nData: {prompt}"
            )
            return response.text
        except Exception as e:
            logger.error(f"Error in Staff Agent: {e}")
            return "Telemetry analysis offline."
