export type RoiInputs = {
  people: number;
  minutesPerTask: number;
  monthlyVolume: number;
  hourlyCost: number;
  reworkRate: number;
  assistedShare: number;
  implementationCost: number;
  monthlyOperatingCost: number;
  lowEfficiency: number;
  baseEfficiency: number;
  highEfficiency: number;
};

export type RoiScenario = {
  efficiency: number;
  assistedHours: number;
  remainingHours: number;
  releasedHours: number;
  grossCapacityValue: number;
  netMonthlyValue: number;
  breakEvenMonths: number | null;
};

export type RoiResult = {
  currentMonthlyHours: number;
  currentMonthlyCost: number;
  scenarios: { low: RoiScenario; base: RoiScenario; high: RoiScenario };
};

function percentage(value: number) {
  return Math.min(100, Math.max(0, value)) / 100;
}

function scenario(inputs: RoiInputs, currentHours: number, efficiency: number): RoiScenario {
  const assistedHours = currentHours * percentage(inputs.assistedShare);
  const releasedHours = assistedHours * percentage(efficiency);
  const remainingHours = Math.max(0, currentHours - releasedHours);
  const grossCapacityValue = releasedHours * inputs.hourlyCost;
  const netMonthlyValue = grossCapacityValue - inputs.monthlyOperatingCost;
  const breakEvenMonths = inputs.implementationCost > 0 && netMonthlyValue > 0
    ? inputs.implementationCost / netMonthlyValue
    : null;
  return { efficiency, assistedHours, remainingHours, releasedHours, grossCapacityValue, netMonthlyValue, breakEvenMonths };
}

export function calculateRoi(inputs: RoiInputs): RoiResult {
  const baseHours = inputs.people * inputs.minutesPerTask * inputs.monthlyVolume / 60;
  const currentMonthlyHours = baseHours * (1 + percentage(inputs.reworkRate));
  return {
    currentMonthlyHours,
    currentMonthlyCost: currentMonthlyHours * inputs.hourlyCost,
    scenarios: {
      low: scenario(inputs, currentMonthlyHours, inputs.lowEfficiency),
      base: scenario(inputs, currentMonthlyHours, inputs.baseEfficiency),
      high: scenario(inputs, currentMonthlyHours, inputs.highEfficiency),
    },
  };
}
