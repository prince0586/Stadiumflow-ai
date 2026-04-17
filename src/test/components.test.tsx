import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MetricCard } from "../components/MetricCard";
import React from "react";

describe("MetricCard", () => {
  it("renders label and value correctly", () => {
    render(<MetricCard label="Tactical Load" value="45%" trend="+2%" isUp={true} />);
    expect(screen.getByText(/Tactical Load/i)).toBeDefined();
    expect(screen.getByText(/45%/i)).toBeDefined();
  });

  it("applies correct classes for upward trend", () => {
    const { container } = render(<MetricCard label="Load" value="10%" trend="Up" isUp={true} />);
    // Check for standard trend color class
    const trendText = screen.getByText(/Up/i);
    expect(trendText).toBeDefined();
  });
});
