import { describe, expect, it } from "vitest";
import { buildNutritionPrompt, fallbackNutritionReply, nutritionSafetyReply, weightChange, type NutritionProfile } from "./nutrition";

const profile: NutritionProfile = {
  user_id: "00000000-0000-4000-8000-000000000001",
  display_name: "Yon",
  goal: "lose_weight",
  dietary_preferences: ["Mediterranean"],
  allergies: ["peanuts"],
  foods_to_avoid: [],
  context_notes: "Prefers simple dinners",
  locale: "en",
  consent_at: "2026-08-24T12:00:00.000Z",
};

describe("personal nutrition coach", () => {
  it("calculates a weight trend without over-interpreting one entry", () => {
    expect(weightChange([{ id: "1", measured_on: "2026-08-24", weight_kg: 82, note: "" }])).toBeNull();
    expect(weightChange([
      { id: "2", measured_on: "2026-08-24", weight_kg: 81.25, note: "" },
      { id: "1", measured_on: "2026-08-01", weight_kg: 83, note: "" },
    ])).toBe(-1.75);
  });

  it("uses the real profile while keeping health and allergy guardrails", () => {
    const prompt = buildNutritionPrompt({ locale: "en", profile, meals: [], weights: [], history: [], message: "What could I have for dinner?" });
    expect(prompt).toContain("peanuts");
    expect(prompt).toContain("Allergies are hard constraints");
    expect(prompt).toContain("Never claim to remember or know something that is not in the supplied data");
    expect(prompt).toContain("Do not prescribe supplements, diagnose conditions or replace a doctor");
  });

  it("interrupts urgent symptoms instead of generating diet advice", () => {
    const response = nutritionSafetyReply("I have chest pain and difficulty breathing", "en");
    expect(response).toEqual(expect.objectContaining({ safetyLevel: "urgent", mode: "fallback" }));
    expect(response?.reply).toContain("urgent medical care");
  });

  it("does not offer weight-loss instructions for an eating-disorder signal", () => {
    const response = nutritionSafetyReply("Quiero dejar de comer durante días para adelgazar", "es");
    expect(response).toEqual(expect.objectContaining({ safetyLevel: "caution" }));
    expect(response?.reply).toContain("dietista-nutricionista");
  });

  it("has a friendly bilingual fallback", () => {
    expect(fallbackNutritionReply("es", profile).reply).toContain("Yon");
    expect(fallbackNutritionReply("en", profile).reply).toContain("non-judgmental");
  });
});
