import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StadiumAgents } from '../lib/agents';

describe('StadiumAgents', () => {
  let agents: StadiumAgents;

  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    agents = new StadiumAgents();
  });

  it('should initialize correctly', () => {
    expect(agents).toBeDefined();
  });

  it('should handle staff summary requests', async () => {
    const telemetry = {
      gateA: 10, gateB: 20, foodCourt: 30, concourseLevel1: 40, parkingZoneC: 50, timestamp: "now"
    };
    const res = await agents.getStaffSummary(telemetry);
    expect(res).toBeDefined();
    expect(typeof res).toBe("string");
  });

  it('should handle missing API key', async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const faultyAgents = new StadiumAgents();
    const res = await faultyAgents.getStaffSummary({ 
      gateA: 10, gateB: 20, foodCourt: 30, concourseLevel1: 40, parkingZoneC: 50, timestamp: "now" 
    });
    expect(res).toBe("GATEWAY_TIMEOUT");
  });
});
