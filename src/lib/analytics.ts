import { track } from "@vercel/analytics";

export const analyticsEvents = [
  "diagnostic_viewed",
  "diagnostic_started",
  "diagnostic_step_completed",
  "diagnostic_completed",
  "recommendation_viewed",
  "roi_tool_started",
  "roi_tool_completed",
  "content_cta_clicked",
  "service_viewed_from_content",
  "lead_form_started",
  "lead_submitted",
  "whatsapp_clicked",
  "email_summary_requested",
] as const;

export type AnalyticsEvent = (typeof analyticsEvents)[number];
type Property = string | number | boolean;

export const safeAnalyticsPropertyKeys = new Set([
  "locale",
  "step",
  "result",
  "source",
  "destination",
  "qualified",
  "scenario",
]);

export function sanitizeAnalyticsProperties(properties: Record<string, Property> = {}) {
  return Object.fromEntries(Object.entries(properties).filter(([key]) => safeAnalyticsPropertyKeys.has(key)));
}

export function trackEvent(event: AnalyticsEvent, properties: Record<string, Property> = {}) {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem("viste-cookie-choice") !== "accepted") return;
  track(event, sanitizeAnalyticsProperties(properties));
}
