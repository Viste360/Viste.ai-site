import { describe, expect, it } from "vitest";
import { analyticsEvents, sanitizeAnalyticsProperties } from "./analytics";

describe("analytics event contract", () => {
  it("contains the documented demand funnel events", () => {
    expect(analyticsEvents).toEqual(expect.arrayContaining(["diagnostic_started", "diagnostic_completed", "roi_tool_completed", "lead_submitted", "whatsapp_clicked", "advisor_started", "advisor_brief_viewed", "advisor_handoff_started"]));
  });

  it("drops free text and personal data from event properties", () => {
    expect(sanitizeAnalyticsProperties({ locale: "es", step: 3, result: "customer", workflow: "private details", email: "person@example.com", company: "Example" })).toEqual({ locale: "es", step: 3, result: "customer" });
  });
});
