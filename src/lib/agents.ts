/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

/**
 * Interface for the response from the Fan Interaction Agent.
 */
export interface FanResponse {
  message: string;
  suggestedAction?: string;
  waitingTimeEstimate?: string;
}

/**
 * Interface for the venue telemetry data.
 */
export interface VenueTelemetry {
  gateA: number; // occupancy percentage
  gateB: number;
  foodCourt: number;
  concourseLevel1: number;
  parkingZoneC: number;
  timestamp: string;
}

/**
 * Agentic-Core: Multi-Agent System for Stadium Coordination.
 * 
 * This module implements two distinct agents:
 * 1. Venue Telemetry Agent: Monitors and interprets mock sensor data.
 * 2. Fan Interaction Agent: Handles conversational requests from attendees.
 */
export class StadiumAgents {
  private ai: GoogleGenAI;

  /**
   * Initializes the StadiumAgents with the provided API key.
   * 
   * @param apiKey The Gemini API key retrieved from process.env.
   */
  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Processes fan queries using the Fan Interaction Agent.
   * 
   * @param query The fan's natural language question.
   * @param telemetry Current venue telemetry to provide context-aware answers.
   * @returns A structured promise containing the agent's advice.
   */
  async getFanAdvice(query: string, telemetry: VenueTelemetry): Promise<FanResponse> {
    const systemInstruction = `
      You are the 'StadiumFlow Fan Concierge', an elite AI assistant for a large-scale sporting venue.
      Your primary goal is to minimize waiting times and solve logistical challenges for fans.
      
      Current Venue Status (Telemetry):
      - Gate A: ${telemetry.gateA}% congestion
      - Gate B: ${telemetry.gateB}% congestion
      - Food Court: ${telemetry.foodCourt}% occupancy
      - VIP Concourse: ${telemetry.concourseLevel1}% density
      - Parking Zone C: ${telemetry.parkingZoneC}% occupancy
      
      Instructions:
      1. Be professional, conversational, and hyper-efficient.
      2. If a fan asks for food or exits, recommend the path with the LOWEST congestion.
      3. Always provide an estimated waiting time if applicable.
      4. If the situation is critical, provide a 'Suggested Action'.
      5. Address accessibility (e.g., mention elevators if relevant).
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: query,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const result = JSON.parse(response.text || "{}");
      return {
        message: result.message || "I'm processing the latest stadium data...",
        suggestedAction: result.suggestedAction,
        waitingTimeEstimate: result.waitingTimeEstimate,
      };
    } catch (error) {
      console.error("Fan Agent Error:", error);
      throw new Error("Failed to communicate with stadium intelligence.");
    }
  }

  /**
   * Generates a status summary for the Staff Command Center.
   * 
   * @param telemetry The latest sensor data.
   * @returns A high-level assessment of crowd movement and coordination status.
   */
  async getStaffSummary(telemetry: VenueTelemetry): Promise<string> {
    const systemInstruction = `
      You are the 'StadiumFlow Venue Telemetry Agent'. Your role is to analyze sensor data
      at scale to detect bottlenecks, security incidents, or coordination failures.
      
      You must produce a concise, high-priority summary for the venue commander.
      Focus on:
      1. Traffic flow anomalies.
      2. Resource reallocation needs.
      3. Critical bottlenecks.
    `;

    const prompt = `Analyze the current telemetry: ${JSON.stringify(telemetry)}. What are the 3 most critical points for coordination right now?`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { systemInstruction },
      });

      return response.text || "No critical alerts at the moment.";
    } catch (error) {
      console.error("Staff Agent Error:", error);
      return "Unable to generate real-time telemetry assessment.";
    }
  }
}
