export const VOICE_POLICY_VERSION = "voice-eu-es-2026-08-21-v1";
export const SPAIN_400_EFFECTIVE_AT = new Date("2026-10-17T00:00:00+02:00");

export type CallPurpose = "inbound_service" | "requested_callback" | "service_callback" | "commercial_follow_up";
export type PolicyReason =
  | "module_disabled"
  | "global_kill_switch"
  | "policy_not_reviewed"
  | "missing_valid_consent"
  | "consent_expired"
  | "suppressed"
  | "outside_calling_hours"
  | "spain_400_number_required";

export type OutboundPolicyInput = {
  enabled: boolean;
  globalKillSwitch: boolean;
  policyReviewed: boolean;
  direction: "inbound" | "outbound";
  purpose: CallPurpose;
  countryCode: string;
  numberType?: string;
  consentStatus?: "granted" | "revoked" | "expired" | "missing";
  consentExpiresAt?: Date | null;
  suppressed: boolean;
  now?: Date;
  localHour?: number;
};

export type PolicyDecision = {
  allowed: boolean;
  reasons: PolicyReason[];
  policyVersion: typeof VOICE_POLICY_VERSION;
  checkedAt: string;
};

function hourInMadrid(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  return Number(parts.find((part) => part.type === "hour")?.value || 0);
}

export function evaluateCallPolicy(input: OutboundPolicyInput): PolicyDecision {
  const now = input.now || new Date();
  const reasons: PolicyReason[] = [];
  if (!input.enabled) reasons.push("module_disabled");
  if (input.globalKillSwitch) reasons.push("global_kill_switch");

  if (input.direction === "outbound") {
    if (!input.policyReviewed) reasons.push("policy_not_reviewed");
    if (input.consentStatus !== "granted") reasons.push("missing_valid_consent");
    if (input.consentExpiresAt && input.consentExpiresAt <= now) reasons.push("consent_expired");
    if (input.suppressed) reasons.push("suppressed");

    const localHour = input.localHour ?? (input.countryCode.toUpperCase() === "ES" ? hourInMadrid(now) : undefined);
    if (typeof localHour === "number" && (localHour < 9 || localHour >= 21)) reasons.push("outside_calling_hours");

    const isSpanishCommercial = input.countryCode.toUpperCase() === "ES"
      && input.purpose === "commercial_follow_up"
      && now >= SPAIN_400_EFFECTIVE_AT;
    if (isSpanishCommercial && input.numberType !== "400") reasons.push("spain_400_number_required");
  }

  return {
    allowed: reasons.length === 0,
    reasons: [...new Set(reasons)],
    policyVersion: VOICE_POLICY_VERSION,
    checkedAt: now.toISOString(),
  };
}

export function countryFromE164(phone: string) {
  if (phone.startsWith("+34")) return "ES";
  if (phone.startsWith("+44")) return "GB";
  if (phone.startsWith("+1")) return "US";
  return "ZZ";
}
