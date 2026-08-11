type TurnstileVerification = {
  success?: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

export type TurnstileResult =
  | { configured: false; success: true }
  | { configured: true; success: true; hostname?: string }
  | { configured: true; success: false; reason: string };

export async function verifyTurnstileToken(input: { token: string; idempotencyKey: string; expectedAction: string }): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return { configured: false, success: true };
  if (!input.token || input.token.length > 2_048) return { configured: true, success: false, reason: "missing-token" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ secret, response: input.token, idempotency_key: input.idempotencyKey }),
    });
    if (!response.ok) return { configured: true, success: false, reason: "verification-unavailable" };
    const result = await response.json() as TurnstileVerification;
    if (!result.success) return { configured: true, success: false, reason: result["error-codes"]?.[0] || "verification-failed" };
    if (result.action && result.action !== input.expectedAction) return { configured: true, success: false, reason: "action-mismatch" };
    return { configured: true, success: true, hostname: result.hostname };
  } catch {
    return { configured: true, success: false, reason: "verification-unavailable" };
  } finally {
    clearTimeout(timeout);
  }
}
