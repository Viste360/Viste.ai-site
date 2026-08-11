import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstileToken } from "./turnstile";

describe("Turnstile server verification", () => {
  afterEach(() => { vi.unstubAllGlobals(); delete process.env.TURNSTILE_SECRET_KEY; });

  it("is a no-op when the optional provider is not configured", async () => {
    await expect(verifyTurnstileToken({ token: "", idempotencyKey: crypto.randomUUID(), expectedAction: "viste_opportunity" })).resolves.toEqual({ configured: false, success: true });
  });

  it("fails closed when configured without a token", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    await expect(verifyTurnstileToken({ token: "", idempotencyKey: crypto.randomUUID(), expectedAction: "viste_opportunity" })).resolves.toEqual({ configured: true, success: false, reason: "missing-token" });
  });

  it("validates action-bound tokens server side", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, action: "viste_opportunity", hostname: "viste.ai" }) }));
    await expect(verifyTurnstileToken({ token: "valid-token", idempotencyKey: crypto.randomUUID(), expectedAction: "viste_opportunity" })).resolves.toEqual({ configured: true, success: true, hostname: "viste.ai" });
  });

  it("rejects a token minted for another action", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, action: "another_form" }) }));
    await expect(verifyTurnstileToken({ token: "valid-token", idempotencyKey: crypto.randomUUID(), expectedAction: "viste_opportunity" })).resolves.toEqual({ configured: true, success: false, reason: "action-mismatch" });
  });
});
