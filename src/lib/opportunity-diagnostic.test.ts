import { describe, expect, it } from "vitest";
import { evaluateDiagnostic, type DiagnosticAnswers, type RecommendationKind } from "./opportunity-diagnostic";

const base: DiagnosticAnswers = {
  workflow: "operations",
  bottleneck: "repetitive",
  volume: "daily",
  systems: ["email", "erp"],
  data: "structured",
  sensitivity: "review",
  outcome: "time",
};

const cases: [RecommendationKind, Partial<DiagnosticAnswers>][] = [
  ["automation", {}],
  ["knowledge", { workflow: "knowledge", bottleneck: "finding", systems: ["documents"], data: "documents", outcome: "accuracy" }],
  ["customer", { workflow: "customer", bottleneck: "unanswered", systems: ["whatsapp", "email"], data: "conversations", outcome: "response" }],
  ["documents", { workflow: "documents", bottleneck: "document_handling", systems: ["documents", "email"], data: "documents", outcome: "accuracy" }],
  ["sales", { workflow: "sales", bottleneck: "follow_up", systems: ["crm", "email"], data: "conversations", outcome: "revenue" }],
  ["data", { workflow: "reporting", bottleneck: "fragmented_data", systems: ["spreadsheets", "erp"], data: "mixed", outcome: "visibility" }],
  ["not_ready", { workflow: "other", bottleneck: "undefined", volume: "occasional", systems: ["other"], data: "limited", outcome: "other" }],
];

describe("evaluateDiagnostic", () => {
  it.each(cases)("returns a transparent %s recommendation", (expected, overrides) => {
    const result = evaluateDiagnostic({ ...base, ...overrides }, "en");
    expect(result.kind).toBe(expected);
    expect(result.reason.length).toBeGreaterThan(80);
    expect(result.assumptions).toHaveLength(3);
    expect(result.dependencies.length).toBeGreaterThanOrEqual(2);
    expect(result.firstMetric).toBeTruthy();
    expect(result.service.href).toMatch(/^\//);
  });

  it("surfaces review requirements for sensitive workflows in Spanish", () => {
    const result = evaluateDiagnostic({ ...base, sensitivity: "regulated" }, "es");
    expect(result.dependencies.join(" ")).toMatch(/privacidad|seguridad/);
    expect(result.title).toMatch(/Candidato/);
  });
});
