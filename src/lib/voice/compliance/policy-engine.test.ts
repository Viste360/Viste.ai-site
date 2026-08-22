import { describe, expect, it } from "vitest";
import { evaluateCallPolicy, SPAIN_400_EFFECTIVE_AT, VOICE_POLICY_VERSION } from "./policy-engine";

const base = {
  enabled: true,
  globalKillSwitch: false,
  policyReviewed: true,
  direction: "outbound" as const,
  purpose: "requested_callback" as const,
  countryCode: "ES",
  consentStatus: "granted" as const,
  consentExpiresAt: new Date("2026-12-01T00:00:00Z"),
  suppressed: false,
  localHour: 12,
  now: new Date("2026-09-01T10:00:00Z"),
};

describe("voice call policy", () => {
  it("allows a reviewed, consented requested callback", () => {
    expect(evaluateCallPolicy(base)).toEqual({ allowed: true, reasons: [], policyVersion: VOICE_POLICY_VERSION, checkedAt: base.now.toISOString() });
  });

  it("denies outbound calls when any mandatory release gate is missing", () => {
    const result = evaluateCallPolicy({ ...base, enabled: false, globalKillSwitch: true, policyReviewed: false, consentStatus: "missing", suppressed: true });
    expect(result.allowed).toBe(false);
    expect(result.reasons).toEqual(expect.arrayContaining(["module_disabled", "global_kill_switch", "policy_not_reviewed", "missing_valid_consent", "suppressed"]));
  });

  it("denies expired consent and calls outside approved hours", () => {
    const result = evaluateCallPolicy({ ...base, consentExpiresAt: new Date("2026-08-31T00:00:00Z"), localHour: 22 });
    expect(result.reasons).toEqual(expect.arrayContaining(["consent_expired", "outside_calling_hours"]));
  });

  it("requires a 400 number for Spanish commercial follow-up from 17 October 2026", () => {
    const result = evaluateCallPolicy({ ...base, purpose: "commercial_follow_up", now: SPAIN_400_EFFECTIVE_AT, consentExpiresAt: new Date("2027-01-01T00:00:00Z"), numberType: "geographic" });
    expect(result.allowed).toBe(false);
    expect(result.reasons).toContain("spain_400_number_required");
    expect(evaluateCallPolicy({ ...base, purpose: "commercial_follow_up", now: SPAIN_400_EFFECTIVE_AT, consentExpiresAt: new Date("2027-01-01T00:00:00Z"), numberType: "400" }).allowed).toBe(true);
  });

  it("keeps an explicitly requested callback distinct from commercial follow-up", () => {
    const result = evaluateCallPolicy({ ...base, now: SPAIN_400_EFFECTIVE_AT, consentExpiresAt: new Date("2027-01-01T00:00:00Z"), numberType: "service" });
    expect(result.reasons).not.toContain("spain_400_number_required");
  });
});
