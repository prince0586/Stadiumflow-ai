/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

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
 */
export class StadiumAgents {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Processes fan queries using streaming for better perceived performance.
   */
  async *getFanAdviceStream(query: string, telemetry: VenueTelemetry) {
    if (!process.env.GEMINI_API_KEY) {
      yield { message: "System Alert: API Gateway Offline." };
      return;
    }

    const systemInstruction = `
      You are 'StadiumFlow Fan Concierge'. Use telemetry and Google Search to assist.
      TELEMETRY: ${JSON.stringify(telemetry)}
      OUTPUT: Markdown stream. Ensure tactical tone.
    `;

    try {
      const response = await this.ai.models.generateContentStream({
        model: "gemini-3.1-pro-preview",
        contents: query,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      for await (const chunk of response) {
        if (chunk.text) yield { message: chunk.text };
      }
    } catch (error) {
      console.error("Fan Agent Stream Error:", error);
      yield { message: "Neural Link Fragmented..." };
    }
  }

  /**
   * Legacy method for non-streaming requirements.
   */
  async getFanAdvice(query: string, telemetry: VenueTelemetry): Promise<FanResponse> {
    const iter = this.getFanAdviceStream(query, telemetry);
    let fullMsg = "";
    for await (const chunk of iter) {
      fullMsg += chunk.message;
    }
    return { message: fullMsg };
  }

  /**
   * Generates a status summary with HIGH thinking level for complex tactical plans.
   */
  async getStaffSummary(telemetry: VenueTelemetry & { planRequest?: boolean }): Promise<string> {
    if (!process.env.GEMINI_API_KEY) return "GATEWAY_TIMEOUT";

    const systemInstruction = telemetry.planRequest 
      ? `You are 'StadiumFlow Tactical Planner'. Create a 3-step egress plan. BE EXTREMELY BRIEF.`
      : `You are 'StadiumFlow Core Intelligence'. Analyze telemetry. 1-line tactical summary.`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `TELEMETRY: ${JSON.stringify(telemetry)}`,
        config: { 
          systemInstruction,
          thinkingConfig: telemetry.planRequest ? { thinkingLevel: ThinkingLevel.HIGH } : undefined
        },
      });

      return response.text || "NO ANOMALIES.";
    } catch (error) {
      console.error("Staff Agent Error:", error);
      return "LINK ERROR";
    }
  }

  /**
   * Multimodal Analysis: Processes incident imagery using Gemini 2.5 Flash.
   */
  async analyzeIncidentImage(base64Data: string, mimeType: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) return "GATEWAY_OFFLINE";

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            { text: "Analyze this stadium incident image. Identify: 1. Threat level (1-10) 2. Immediate tactical recommendation. Be extremely brief." },
            { inlineData: { data: base64Data, mimeType } }
          ]
        }
      });
      return response.text || "VISION_ANOMALY: NO_DATA";
    } catch (error) {
      console.error("Image Analysis Error:", error);
      return "VISION_LINK_FAILURE";
    }
  }
}
