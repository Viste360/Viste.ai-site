import { trackEvent } from "./analytics";

export type OpportunityFunnelEvent = "advisor_viewed" | "advisor_started" | "advisor_step_completed" | "advisor_brief_viewed" | "advisor_handoff_started";

function analyticsSessionId() {
  const key = "viste-advisor-session";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.sessionStorage.setItem(key, created);
  return created;
}
export function recordOpportunityEvent(event: OpportunityFunnelEvent, input: { locale: "en" | "es"; step?: number; intent?: string }) {
  if (typeof window === "undefined" || window.localStorage.getItem("viste-cookie-choice") !== "accepted") return;
  const query = new URLSearchParams(window.location.search);
  const payload = {
    sessionId: analyticsSessionId(), event, locale: input.locale, step: input.step, intent: input.intent,
    path: window.location.pathname, utmSource: query.get("utm_source") || "", utmMedium: query.get("utm_medium") || "",
    utmCampaign: query.get("utm_campaign") || "",
  };
  trackEvent(event, { locale: input.locale, step: input.step || 0, result: input.intent || "unclassified" });
  void fetch("/api/analytics/opportunity", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), keepalive: true });
}
