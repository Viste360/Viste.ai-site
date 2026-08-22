import { createHmac, timingSafeEqual } from "node:crypto";

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashTelephone(phoneE164: string, salt: string) {
  return createHmac("sha256", salt).update(phoneE164).digest("hex");
}

export function verifyElevenLabsSignature(input: {
  rawBody: string;
  signatureHeader: string | null;
  secret: string;
  now?: Date;
  toleranceSeconds?: number;
}) {
  if (!input.signatureHeader || !input.secret) return false;
  const fields = Object.fromEntries(input.signatureHeader.split(",").map((item) => item.trim().split("=", 2)));
  const timestamp = fields.t;
  const signature = fields.v0;
  if (!timestamp || !signature || !/^\d+$/.test(timestamp) || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const nowSeconds = Math.floor((input.now || new Date()).getTime() / 1_000);
  const age = nowSeconds - Number(timestamp);
  if (age < -300 || age > (input.toleranceSeconds ?? 1_800)) return false;
  const digest = createHmac("sha256", input.secret).update(`${timestamp}.${input.rawBody}`).digest("hex");
  return safeEqual(signature.toLowerCase(), digest);
}

export function verifyTwilioSignature(input: {
  url: string;
  parameters: URLSearchParams;
  signatureHeader: string | null;
  authToken: string;
}) {
  if (!input.signatureHeader || !input.authToken) return false;
  const entries = [...input.parameters.entries()].sort(([leftName, leftValue], [rightName, rightValue]) => (
    leftName === rightName ? leftValue.localeCompare(rightValue) : leftName.localeCompare(rightName)
  ));
  const payload = entries.reduce((value, [name, item]) => `${value}${name}${item}`, input.url);
  const digest = createHmac("sha1", input.authToken).update(payload).digest("base64");
  return safeEqual(input.signatureHeader, digest);
}

export function verifyVoiceToolSignature(input: {
  rawBody: string;
  timestampHeader: string | null;
  signatureHeader: string | null;
  secret: string;
  now?: Date;
}) {
  if (!input.timestampHeader || !/^\d+$/.test(input.timestampHeader) || !input.signatureHeader || !input.secret) return false;
  const nowSeconds = Math.floor((input.now || new Date()).getTime() / 1_000);
  const age = nowSeconds - Number(input.timestampHeader);
  if (age < -60 || age > 300) return false;
  const digest = createHmac("sha256", input.secret).update(`${input.timestampHeader}.${input.rawBody}`).digest("hex");
  return safeEqual(input.signatureHeader.toLowerCase(), digest);
}

export function verifyVoiceToolBearer(input: {
  authorizationHeader: string | null;
  secret: string;
}) {
  if (!input.authorizationHeader || !input.secret) return false;
  const [scheme, token, ...extra] = input.authorizationHeader.trim().split(/\s+/);
  return extra.length === 0 && scheme?.toLowerCase() === "bearer" && Boolean(token) && safeEqual(token, input.secret);
}

export function redactProviderEvent(data: Record<string, unknown>) {
  const allowed = [
    "agent_id", "conversation_id", "status", "call_duration_secs", "direction",
    "failure_reason", "termination_reason", "event_timestamp", "type",
  ];
  return Object.fromEntries(allowed.flatMap((key) => key in data ? [[key, data[key]]] : []));
}
