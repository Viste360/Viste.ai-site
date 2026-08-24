"use client";

import { createClient, type Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

export function useNutritionAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_NUTRITION_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_NUTRITION_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  const configured = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes("example.supabase.co") && !supabaseKey.includes("example"));
  const supabase = useMemo(() => configured ? createClient(supabaseUrl, supabaseKey) : null, [configured, supabaseKey, supabaseUrl]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) { setSession(data.session); setLoading(false); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [supabase]);

  async function signInWithGoogle(locale: "en" | "es") {
    if (!supabase) return locale === "es" ? "El acceso privado todavía no está configurado." : "Private access is not configured yet.";
    const returnPath = locale === "es" ? "/es/nutricion" : "/nutrition";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${returnPath}`,
        scopes: "openid email profile",
        queryParams: { prompt: "select_account" },
      },
    });
    return error?.message || null;
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
  }

  return { configured, loading, session, supabase, signInWithGoogle, signOut };
}
