/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VenueTelemetry } from "./agents";

/**
 * Generates mock stadium telemetry data for simulation.
 * 
 * @returns A VenueTelemetry object with randomized but realistic stadium metrics.
 */
export function generateMockTelemetry(): VenueTelemetry {
  return {
    gateA: Math.floor(Math.random() * 100),
    gateB: Math.floor(Math.random() * 100),
    foodCourt: Math.floor(Math.random() * 100),
    concourseLevel1: Math.floor(Math.random() * 100),
    parkingZoneC: Math.floor(Math.random() * 100),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Historical telemetry data for trend analysis.
 * 
 * @param points Number of historical points to generate.
 */
export function generateHistoricalData(points: number = 20) {
  return Array.from({ length: points }).map((_, i) => ({
    time: i,
    congestion: Math.floor(40 + Math.random() * 50),
    flowRate: Math.floor(200 + Math.random() * 800),
  }));
}
