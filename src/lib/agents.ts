/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";

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
 * Optimized for AI Studio: Calls Gemini directly from the frontend
 * using the platform-provided environment keys.
 */
export class StadiumAgents {
  private ai: GoogleGenAI;

  constructor() {
    // API Key is automatically provided by the AI Studio environment
    const apiKey = process.env.GEMINI_API_KEY || "";
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Processes fan queries using the Fan Interaction Agent.
   * Utilizes Gemini 3.1 Pro with Search Grounding for real-time venue accuracy.
   */
  async getFanAdvice(query: string, telemetry: VenueTelemetry): Promise<FanResponse> {
    if (!process.env.GEMINI_API_KEY) {
      return { message: "System Alert: API Gateway Offline. Please configure GEMINI_API_KEY in platform settings." };
    }

    const systemInstruction = `
      You are 'StadiumFlow Fan Concierge', an elite AI assistant for high-capacity venue logistics.
      Goal: Minimize attendee friction, optimize dispersal, and ensure safety.
      
      TELEMETRY FEED: ${JSON.stringify(telemetry)}
      
      CORE PROTOCOLS:
      1. CRITICAL: Analyze telemetry to redirect attendees from High-Density zones (>80%).
      2. LOGISTICAL: Recommend specific routes and provide estimated wait times (monospaced).
      3. TACTICAL: If asked about amenities, use Search to provide real-time updates if available.
      4. OUTPUT: Strictly valid JSON. { "message": string, "suggestedAction": string, "waitingTimeEstimate": string }.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: query,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              message: { type: Type.STRING },
              suggestedAction: { type: Type.STRING },
              waitingTimeEstimate: { type: Type.STRING }
            },
            required: ["message"]
          }
        },
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Fan Agent Error:", error);
      return { message: "Internal Neural Link Failure. Retrying coordination..." };
    }
  }

  /**
   * Generates a status summary for the Staff Command Center.
   * Uses Gemini 3.1 Pro for high-reasoning anomaly detection.
   */
  async getStaffSummary(telemetry: VenueTelemetry): Promise<string> {
    if (!process.env.GEMINI_API_KEY) return "GATEWAY_TIMEOUT: NO_API_KEY";

    const systemInstruction = `
      You are 'StadiumFlow Core Intelligence'. Analyze spatial telemetry for commanders.
      Detect: Bottlenecks, illegal dispersal patterns, or security anomalies.
      Style: Tactical, brief, data-driven.
    `;

    const prompt = `AUDIT CURRENT TELEMETRY: ${JSON.stringify(telemetry)}. GEN 1-LINE SUMMARY.`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: { systemInstruction },
      });

      return response.text || "NO CRITICAL ANOMALIES DETECTED.";
    } catch (error) {
      console.error("Staff Agent Error:", error);
      return "TELEMETRY ANALYSIS SUSPENDED // LINK ERROR";
    }
  }
}
