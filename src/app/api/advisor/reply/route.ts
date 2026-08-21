import { createHash, randomUUID } from "node:crypto";
import { openai } from "@ai-sdk/openai";
import { gateway, generateText, Output } from "ai";
import { NextRequest, NextResponse } from "next/server";
import {
  advisorConversationReplySchema,
  advisorConversationRequestSchema,
  buildAdvisorSystemPrompt,
  fallbackAdvisorReply,
  isClearlyNonsense,
  isObviouslyVague,
  wantsHumanContact,
} from "@/lib/advisor-conversation";

const attempts = new Map<string, { count: number; resetAt: number }>();
const salt = process.env.CONTACT_IP_SALT || randomUUID();
const windowMs = 15 * 60_000;
const maximumTurns = 18;

function advisorModel() {
  const configured = process.env.OPENAI_ADVISOR_MODEL || "gpt-5.6-terra";
  const openAIModel = configured.replace(/^openai\//, "");
  return process.env.AI_GATEWAY_API_KEY || process.env.VERCEL
    ? gateway(`openai/${openAIModel}`)
    : openai(openAIModel);
}

function json(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function validOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === request.nextUrl.host; } catch { return false; }
}

function isLimited(key: string) {
  const now = Date.now();
  if (attempts.size > 1_000) for (const [storedKey, entry] of attempts) if (entry.resetAt < now) attempts.delete(storedKey);
  const current = attempts.get(key);
  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  current.count += 1;
  return current.count > maximumTurns;
}

export async function POST(request: NextRequest) {
  if (!validOrigin(request)) return json({ error: "Invalid origin" }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "Unsupported content type" }, 415);
  if (Number(request.headers.get("content-length") || 0) > 8_000) return json({ error: "Request too large" }, 413);

  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const ipHash = createHash("sha256").update(`${salt}:${ip}`).digest("hex");
  if (isLimited(ipHash)) return json({ error: "Too many messages. Please try again later." }, 429);

  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const parsed = advisorConversationRequestSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Please send a shorter business answer." }, 400);
  const input = parsed.data;

  const modelAvailable = Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL || process.env.OPENAI_API_KEY);
  if (isObviouslyVague(input.answer) || isClearlyNonsense(input.answer) || wantsHumanContact(input.answer) || !modelAvailable) {
    return json(fallbackAdvisorReply(input));
  }

  try {
    const result = await generateText({
      model: advisorModel(),
      system: buildAdvisorSystemPrompt(input.locale),
      prompt: JSON.stringify({
        currentStage: input.stage,
        recoveryAttempts: input.recoveryAttempts,
        acceptedContext: input.context,
        visitorAnswer: input.answer,
      }),
      output: Output.object({ schema: advisorConversationReplySchema }),
      maxOutputTokens: 500,
      abortSignal: AbortSignal.timeout(12_000),
    });
    return json({ ...result.output, mode: "ai" });
  } catch (error) {
    const gatewayDetails = error && typeof error === "object" ? error as { message?: unknown; statusCode?: unknown; generationId?: unknown } : null;
    console.warn(JSON.stringify({
      event: "advisor_generation_fallback",
      error: error instanceof Error ? error.name : "UnknownError",
      message: typeof gatewayDetails?.message === "string" ? gatewayDetails.message.slice(0, 240) : undefined,
      statusCode: typeof gatewayDetails?.statusCode === "number" ? gatewayDetails.statusCode : undefined,
      generationId: typeof gatewayDetails?.generationId === "string" ? gatewayDetails.generationId : undefined,
    }));
    return json(fallbackAdvisorReply(input));
  }
}
