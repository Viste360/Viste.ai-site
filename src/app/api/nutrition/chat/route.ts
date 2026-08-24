import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  buildNutritionPrompt,
  fallbackNutritionReply,
  nutritionChatRequestSchema,
  nutritionReplySchema,
  nutritionSafetyReply,
  type NutritionMeal,
  type NutritionMessage,
  type NutritionProfile,
  type NutritionWeight,
} from "@/lib/nutrition";
import { authoriseNutritionRequest } from "@/lib/nutrition-auth";

const attempts = new Map<string, { count: number; resetAt: number }>();
const rateSalt = process.env.CONTACT_IP_SALT || randomUUID();

function json(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function validOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === request.nextUrl.host; } catch { return false; }
}

function limited(userId: string, request: NextRequest) {
  const now = Date.now();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const key = createHash("sha256").update(`${rateSalt}:${userId}:${ip}`).digest("hex");
  const current = attempts.get(key);
  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + 15 * 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 30;
}

export async function POST(request: NextRequest) {
  if (!validOrigin(request)) return json({ error: "Invalid origin" }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "Unsupported content type" }, 415);
  if (Number(request.headers.get("content-length") || 0) > 5_000) return json({ error: "Request too large" }, 413);

  const auth = await authoriseNutritionRequest(request);
  if (!auth) return json({ error: "Authentication required" }, 401);
  if (limited(auth.user.id, request)) return json({ error: "Too many messages. Please try again later." }, 429);

  let input: unknown;
  try { input = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const parsed = nutritionChatRequestSchema.safeParse(input);
  if (!parsed.success) return json({ error: "Please send a shorter message." }, 400);

  const [profileResult, mealsResult, weightsResult, historyResult] = await Promise.all([
    auth.scoped.from("nutrition_profiles").select("user_id,display_name,goal,dietary_preferences,allergies,foods_to_avoid,context_notes,locale,consent_at").maybeSingle(),
    auth.scoped.from("nutrition_meals").select("id,eaten_at,meal_type,description,hunger_before,fullness_after").order("eaten_at", { ascending: false }).limit(14),
    auth.scoped.from("nutrition_weights").select("id,measured_on,weight_kg,note").order("measured_on", { ascending: false }).limit(12),
    auth.scoped.from("nutrition_messages").select("id,role,content,safety_level,created_at").order("created_at", { ascending: false }).limit(12),
  ]);
  if (profileResult.error || mealsResult.error || weightsResult.error || historyResult.error) return json({ error: "Nutrition profile is temporarily unavailable" }, 503);
  if (!profileResult.data) return json({ error: "Complete your private profile first" }, 409);

  const profile = profileResult.data as NutritionProfile;
  const meals = (mealsResult.data || []) as NutritionMeal[];
  const weights = (weightsResult.data || []).map((entry) => ({ ...entry, weight_kg: Number(entry.weight_kg) })) as NutritionWeight[];
  const history = ([...(historyResult.data || [])].reverse()) as NutritionMessage[];
  const message = parsed.data.message;

  const { error: userMessageSaveError } = await auth.scoped.from("nutrition_messages").insert({
    user_id: auth.user.id,
    role: "user",
    content: message,
    safety_level: "general",
  });
  if (userMessageSaveError) return json({ error: "The message could not be saved securely" }, 503);

  let reply = nutritionSafetyReply(message, parsed.data.locale);
  if (!reply) {
    try {
      if (!process.env.OPENAI_API_KEY) throw new Error("nutrition-model-unavailable");
      const result = await generateText({
        model: openai((process.env.OPENAI_NUTRITION_MODEL || process.env.OPENAI_ADVISOR_MODEL || "gpt-5.6-terra").replace(/^openai\//, "")),
        prompt: buildNutritionPrompt({ locale: parsed.data.locale, profile, meals, weights, history, message }),
        output: Output.object({ schema: nutritionReplySchema }),
        maxOutputTokens: 550,
        abortSignal: AbortSignal.timeout(15_000),
      });
      reply = { ...result.output, mode: "ai" };
    } catch {
      reply = fallbackNutritionReply(parsed.data.locale, profile);
    }
  }

  const { error: saveError } = await auth.scoped.from("nutrition_messages").insert({
    user_id: auth.user.id,
    role: "assistant",
    content: reply.reply,
    safety_level: reply.safetyLevel,
  });
  if (saveError) return json({ error: "The reply could not be saved securely" }, 503);
  return json(reply);
}
