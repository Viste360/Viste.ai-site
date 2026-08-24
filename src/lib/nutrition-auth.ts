import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

export type NutritionAuthorisation = {
  scoped: SupabaseClient;
  user: User;
};

export async function authoriseNutritionRequest(request: NextRequest): Promise<NutritionAuthorisation | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const url = process.env.NEXT_PUBLIC_NUTRITION_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishable = process.env.NEXT_PUBLIC_NUTRITION_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!token || !url || !publishable || url.includes("example.supabase.co") || publishable.includes("example")) return null;
  const scoped = createClient(url, publishable, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await scoped.auth.getUser(token);
  if (error || !data.user) return null;
  return { scoped, user: data.user };
}
