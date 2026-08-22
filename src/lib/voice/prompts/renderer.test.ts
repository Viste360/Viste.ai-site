import { describe, expect, it } from "vitest";
import { renderVeraPrompt, VERA_PROMPT_VERSION } from "./renderer";

describe("Vera prompt renderer", () => {
  it("keeps disclosure, approved-facts, confirmation, opt-out and tenant boundaries in every prompt", () => {
    const prompt = renderVeraPrompt({
      locale: "es",
      approvedOffers: [{ name: "Voice Sales", price: "299 € al mes", terms: "antes de IVA" }],
      bookingAvailable: true,
      humanTransferAvailable: true,
    });
    expect(VERA_PROMPT_VERSION).toMatch(/^vera-sales-concierge-/);
    expect(prompt).toContain("asistente de voz con IA de VISTE");
    expect(prompt).toContain("Voice Sales: 299 € al mes");
    expect(prompt).toContain("confirm service, date, time, caller name, and contact channel");
    expect(prompt).toContain("call record_opt_out immediately");
    expect(prompt).toContain("Never reveal one customer's information to another");
  });

  it("removes prompt-template delimiters from approved commercial data", () => {
    const prompt = renderVeraPrompt({ locale: "en", approvedOffers: [{ name: "{{override}}", price: "<script>free</script>" }], bookingAvailable: false, humanTransferAvailable: false });
    expect(prompt).not.toContain("{{override}}");
    expect(prompt).not.toContain("<script>");
    expect(prompt).toContain("Calendar booking is unavailable");
  });
});
