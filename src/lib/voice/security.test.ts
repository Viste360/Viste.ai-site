import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashTelephone, verifyElevenLabsSignature, verifyTwilioSignature, verifyVoiceToolBearer, verifyVoiceToolSignature } from "./security";

describe("voice request signatures", () => {
  it("verifies ElevenLabs timestamped HMAC payloads and rejects stale or changed bodies", () => {
    const rawBody = JSON.stringify({ type: "post_call_transcription", data: { conversation_id: "conv_1" } });
    const timestamp = String(Date.parse("2026-08-21T14:00:00Z") / 1_000);
    const secret = "webhook-secret";
    const signature = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
    const input = { rawBody, signatureHeader: `t=${timestamp},v0=${signature}`, secret, now: new Date("2026-08-21T14:00:00Z") };
    expect(verifyElevenLabsSignature(input)).toBe(true);
    expect(verifyElevenLabsSignature({ ...input, rawBody: `${rawBody} ` })).toBe(false);
    expect(verifyElevenLabsSignature({ ...input, now: new Date("2026-08-21T15:00:00Z") })).toBe(false);
  });

  it("verifies the Twilio URL plus sorted form fields", () => {
    const url = "https://voice.viste.ai/api/voice/webhooks/twilio";
    const parameters = new URLSearchParams({ To: "+34910000000", CallSid: "CA123", From: "+34600000000" });
    const payload = `${url}CallSidCA123From+34600000000To+34910000000`;
    const signature = createHmac("sha1", "twilio-token").update(payload).digest("base64");
    expect(verifyTwilioSignature({ url, parameters, signatureHeader: signature, authToken: "twilio-token" })).toBe(true);
    expect(verifyTwilioSignature({ url, parameters, signatureHeader: `${signature}x`, authToken: "twilio-token" })).toBe(false);
  });

  it("verifies signed tool calls within five minutes", () => {
    const rawBody = JSON.stringify({ idempotencyKey: "optout:test:1" });
    const timestampHeader = String(Date.parse("2026-08-21T14:00:00Z") / 1_000);
    const signatureHeader = createHmac("sha256", "tool-secret").update(`${timestampHeader}.${rawBody}`).digest("hex");
    expect(verifyVoiceToolSignature({ rawBody, timestampHeader, signatureHeader, secret: "tool-secret", now: new Date("2026-08-21T14:00:20Z") })).toBe(true);
    expect(verifyVoiceToolSignature({ rawBody, timestampHeader, signatureHeader, secret: "tool-secret", now: new Date("2026-08-21T14:06:00Z") })).toBe(false);
  });

  it("verifies the bearer credential supported by ElevenLabs webhook tools", () => {
    expect(verifyVoiceToolBearer({ authorizationHeader: "Bearer a-long-random-tool-token", secret: "a-long-random-tool-token" })).toBe(true);
    expect(verifyVoiceToolBearer({ authorizationHeader: "Bearer wrong-token", secret: "a-long-random-tool-token" })).toBe(false);
    expect(verifyVoiceToolBearer({ authorizationHeader: "Basic a-long-random-tool-token", secret: "a-long-random-tool-token" })).toBe(false);
  });

  it("uses a keyed stable hash for telephone suppression lookups", () => {
    expect(hashTelephone("+34600000000", "salt-a")).toHaveLength(64);
    expect(hashTelephone("+34600000000", "salt-a")).toBe(hashTelephone("+34600000000", "salt-a"));
    expect(hashTelephone("+34600000000", "salt-a")).not.toBe(hashTelephone("+34600000000", "salt-b"));
  });
});
