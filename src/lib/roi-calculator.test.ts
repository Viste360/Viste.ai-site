import { describe, expect, it } from "vitest";
import { calculateRoi, type RoiInputs } from "./roi-calculator";

const inputs: RoiInputs = {
  people: 2,
  minutesPerTask: 30,
  monthlyVolume: 100,
  hourlyCost: 50,
  reworkRate: 10,
  assistedShare: 80,
  implementationCost: 10_000,
  monthlyOperatingCost: 200,
  lowEfficiency: 30,
  baseEfficiency: 50,
  highEfficiency: 70,
};

describe("calculateRoi", () => {
  it("uses the visible effort and break-even formula", () => {
    const result = calculateRoi(inputs);
    expect(result.currentMonthlyHours).toBeCloseTo(110);
    expect(result.currentMonthlyCost).toBeCloseTo(5_500);
    expect(result.scenarios.base.assistedHours).toBeCloseTo(88);
    expect(result.scenarios.base.releasedHours).toBeCloseTo(44);
    expect(result.scenarios.base.remainingHours).toBeCloseTo(66);
    expect(result.scenarios.base.grossCapacityValue).toBeCloseTo(2_200);
    expect(result.scenarios.base.netMonthlyValue).toBeCloseTo(2_000);
    expect(result.scenarios.base.breakEvenMonths).toBeCloseTo(5);
  });

  it("does not invent a break-even when monthly value is not positive", () => {
    const result = calculateRoi({ ...inputs, monthlyOperatingCost: 10_000 });
    expect(result.scenarios.low.breakEvenMonths).toBeNull();
    expect(result.scenarios.base.breakEvenMonths).toBeNull();
    expect(result.scenarios.high.breakEvenMonths).toBeNull();
  });
});
