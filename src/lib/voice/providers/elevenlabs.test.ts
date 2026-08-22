import { describe, expect, it, vi } from "vitest";
import { ElevenLabsVoiceProvider } from "./elevenlabs";

describe("ElevenLabs provider adapter", () => {
  it("will not start an outbound call after a denied policy decision", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const provider = new ElevenLabsVoiceProvider({ apiKey: "key", webhookSecret: "secret", fetcher });
    await expect(provider.startOutboundCall({
      externalAgentId: "agent_1",
      externalPhoneNumberId: "phone_1",
      toNumber: "+34600000000",
      policyDecision: { allowed: false, reasons: ["missing_valid_consent"], policyVersion: "voice-eu-es-2026-08-21-v1", checkedAt: new Date().toISOString() },
    })).rejects.toThrow("Outbound call denied");
    expect(fetcher).not.toHaveBeenCalled();
  });
});
