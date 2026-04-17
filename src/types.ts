import { VenueTelemetry } from "./lib/agents";

export type AppRole = "fan" | "staff";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    action?: string;
    wait?: string;
  };
}

export interface ComponentProps {
  telemetry: VenueTelemetry;
  historicalData?: any[];
  theme?: "light" | "dark";
}
