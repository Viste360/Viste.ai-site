import { describe, expect, it } from "vitest";
import { buildAdvisorSystemPrompt, fallbackAdvisorReply, isClearlyNonsense, isObviouslyVague, isWeakForStage } from "./advisor-conversation";

const base = {
  locale: "en" as const,
  recoveryAttempts: 0,
  context: { business: "", goal: "", situation: "" },
};

describe("advisor conversation guardrails", () => {
  it("does not advance vague answers", () => {
    expect(isObviouslyVague("not sure")).toBe(true);
    const reply = fallbackAdvisorReply({ ...base, stage: "business", answer: "not sure" });
    expect(reply.nextStage).toBe("business");
    expect(reply.normalizedAnswer).toBe("");
    expect(reply.quality).toBe("recoverable");
    expect(reply.reply).toContain("what the business sells or does");
  });

  it("closes repeated nonsense before collecting personal details", () => {
    expect(isClearlyNonsense("asdfasdfasdf")).toBe(true);
    const reply = fallbackAdvisorReply({ ...base, recoveryAttempts: 1, stage: "business", answer: "asdfasdfasdf" });
    expect(reply.nextStage).toBe("closed");
    expect(reply.quality).toBe("rejected");
    expect(reply.normalizedAnswer).toBe("");
  });

  it("does not treat a meta-question as a description of the business", () => {
    const first = { ...base, stage: "business" as const, answer: "qué problema dices" };
    expect(isWeakForStage(first)).toBe(true);
    expect(fallbackAdvisorReply(first)).toEqual(expect.objectContaining({ nextStage: "business", quality: "recoverable" }));
    expect(fallbackAdvisorReply({ ...first, recoveryAttempts: 1 })).toEqual(expect.objectContaining({ nextStage: "closed", quality: "rejected" }));
  });

  it("requires stage-relevant context before advancing in fallback mode", () => {
    expect(isWeakForStage({ ...base, stage: "business", answer: "something online" })).toBe(true);
    expect(isWeakForStage({ ...base, stage: "business", answer: "I run a local hair salon for families." })).toBe(false);
    expect(isWeakForStage({ ...base, stage: "goal", answer: "Ayúdame a elegir" })).toBe(true);
    expect(isWeakForStage({ ...base, stage: "situation", answer: "We use email and Excel today." })).toBe(false);
  });

  it("moves an explicit Rupert request to the protected contact step", () => {
    const reply = fallbackAdvisorReply({ ...base, stage: "business", answer: "Can I speak to Rupert?" });
    expect(reply.nextStage).toBe("contact");
    expect(reply.reply).toContain("security check");
    expect(reply.reply).not.toContain("wa.me");
  });

  it("does not confuse a customer's booking need with a human handoff request", () => {
    const reply = fallbackAdvisorReply({
      ...base,
      stage: "business",
      answer: "We run a local hair salon and want customers to book appointments on our website.",
    });
    expect(reply.nextStage).toBe("goal");
    expect(reply.intent).toBe("CUSTOM_PRODUCT");
  });

  it("keeps the Spanish handoff equivalent", () => {
    const reply = fallbackAdvisorReply({ ...base, locale: "es", stage: "goal", answer: "Quiero hablar con una persona" });
    expect(reply.nextStage).toBe("contact");
    expect(reply.reply).toContain("verificación de seguridad");
  });

  it("classifies a concrete full-stack request without inventing an offer", () => {
    const reply = fallbackAdvisorReply({ ...base, stage: "business", answer: "We build a booking website and admin portal for clinics" });
    expect(reply.nextStage).toBe("goal");
    expect(reply.intent).toBe("CUSTOM_PRODUCT");
    expect(reply.normalizedAnswer).toContain("admin portal");
  });

  it("tells the model to reject weak answers and invented claims", () => {
    const prompt = buildAdvisorSystemPrompt("en");
    expect(prompt).toContain("Do not advance just because text was entered");
    expect(prompt).toContain("Never invent clients, partnerships, results, prices, timelines");
    expect(prompt).toContain("secure contact form and robot check");
    expect(prompt).toContain("thoughtful consultant, not a scripted salesperson");
    expect(prompt).toContain("Do not say “I know exactly how you feel.”");
  });
});
