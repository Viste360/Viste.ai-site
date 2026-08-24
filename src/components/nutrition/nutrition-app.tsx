"use client";

import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiActivity, FiBookOpen, FiCheck, FiChevronRight, FiLogOut, FiMessageCircle, FiPlus, FiShield, FiTarget, FiUser } from "react-icons/fi";
import type { NutritionGoal, NutritionMeal, NutritionMealType, NutritionMessage, NutritionProfile, NutritionReply, NutritionWeight } from "@/lib/nutrition";
import styles from "./nutrition.module.css";
import { useNutritionAuth } from "./use-nutrition-auth";

type Locale = "en" | "es";
type View = "coach" | "log" | "progress" | "profile";

const copy = {
  en: {
    eyebrow: "Viste.ai · private beta", title: "Your personal nutrition coach", lead: "A calm place to record what you eat, follow your weight trend and receive practical guidance that remembers your preferences.",
    signIn: "Email me a private access link", email: "Your email", emailPlaceholder: "you@example.com", linkSent: "Check your inbox. We sent you a private sign-in link.", private: "Your meals and weight remain linked only to your account.", unavailable: "Private access is not configured in this environment yet.", loading: "Opening your private space…", signOut: "Sign out",
    coach: "Coach", log: "Food log", progress: "Progress", profile: "Profile", hello: "Good to see you", today: "Today", recent: "Recent meals", noMeals: "No meals recorded yet. Add the first one when you are ready.", noWeights: "Add two or more weigh-ins to see a trend without overreacting to daily changes.",
    ask: "Ask about your meals, habits or progress", placeholder: "For example: I’m hungry in the afternoon. What could I change?", send: "Send", thinking: "Looking at your profile and recent log…", chatEmpty: "Tell me what you ate or what feels difficult today. I’ll use your profile and recent entries, without judging.",
    addMeal: "Add a meal", mealType: "Meal", eatenAt: "When", description: "What did you eat?", mealPlaceholder: "Chicken, rice, salad and water…", hunger: "Hunger before (optional)", fullness: "Fullness after (optional)", saveMeal: "Save meal", saving: "Saving…",
    addWeight: "Record weight", date: "Date", weight: "Weight (kg)", note: "Note (optional)", saveWeight: "Save weight", latestWeight: "Latest weight", change: "Recorded change", entries: "weigh-ins", noTrend: "More entries needed", kg: "kg",
    setup: "Set up your private profile", setupLead: "This gives the coach enough context to be useful without guessing.", name: "What should I call you?", goal: "Main goal", goals: { eat_better: "Eat better", lose_weight: "Lose weight gradually", maintain_weight: "Maintain weight" }, preferences: "Eating style or preferences", preferencesHint: "Separate with commas, e.g. Mediterranean, vegetarian", allergies: "Allergies", allergiesHint: "Separate with commas. The coach treats these as hard limits.", avoid: "Foods you dislike or avoid", context: "Useful context", contextHint: "Schedules, routines or anything that helps. Do not add information you do not want the coach to use.", consent: "I explicitly agree that Viste.ai stores and processes my food and weight information to provide this private coaching experience.", saveProfile: "Save private profile", updateProfile: "Update profile", profileSaved: "Profile saved.",
    safetyTitle: "Support, not medical treatment", safety: "This coach offers general wellbeing guidance. It does not diagnose conditions or replace a doctor or registered dietitian. Urgent or high-risk situations are redirected to professional care.", error: "Something did not save correctly. Please try again.", requiredProfile: "Complete your profile before using the coach.", breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack", other: "Other",
  },
  es: {
    eyebrow: "Viste.ai · beta privada", title: "Tu asesor nutricional personal", lead: "Un espacio tranquilo para registrar lo que comes, seguir la evolución del peso y recibir orientación práctica que recuerda tus preferencias.",
    signIn: "Enviarme un enlace de acceso privado", email: "Tu email", emailPlaceholder: "tu@email.com", linkSent: "Revisa tu correo. Te hemos enviado un enlace privado para entrar.", private: "Tus comidas y tu peso quedan vinculados únicamente a tu cuenta.", unavailable: "El acceso privado todavía no está configurado en este entorno.", loading: "Abriendo tu espacio privado…", signOut: "Cerrar sesión",
    coach: "Asesor", log: "Comidas", progress: "Progreso", profile: "Perfil", hello: "Qué bien verte", today: "Hoy", recent: "Comidas recientes", noMeals: "Todavía no has registrado comidas. Añade la primera cuando quieras.", noWeights: "Añade dos o más registros para ver una tendencia sin dar demasiada importancia a los cambios diarios.",
    ask: "Pregunta sobre tus comidas, hábitos o progreso", placeholder: "Por ejemplo: por la tarde tengo mucha hambre. ¿Qué podría cambiar?", send: "Enviar", thinking: "Revisando tu perfil y los últimos registros…", chatEmpty: "Cuéntame qué has comido o qué te está costando hoy. Usaré tu perfil y tus registros recientes, sin juzgarte.",
    addMeal: "Añadir una comida", mealType: "Comida", eatenAt: "Cuándo", description: "¿Qué has comido?", mealPlaceholder: "Pollo, arroz, ensalada y agua…", hunger: "Hambre antes (opcional)", fullness: "Saciedad después (opcional)", saveMeal: "Guardar comida", saving: "Guardando…",
    addWeight: "Registrar peso", date: "Fecha", weight: "Peso (kg)", note: "Nota (opcional)", saveWeight: "Guardar peso", latestWeight: "Último peso", change: "Cambio registrado", entries: "registros", noTrend: "Faltan más registros", kg: "kg",
    setup: "Configura tu perfil privado", setupLead: "Así el asesor tendrá el contexto necesario para ayudarte sin inventar.", name: "¿Cómo quieres que te llame?", goal: "Objetivo principal", goals: { eat_better: "Comer mejor", lose_weight: "Bajar de peso gradualmente", maintain_weight: "Mantener el peso" }, preferences: "Estilo de alimentación o preferencias", preferencesHint: "Sepáralas con comas, por ejemplo: mediterránea, vegetariana", allergies: "Alergias", allergiesHint: "Sepáralas con comas. El asesor las tratará como límites estrictos.", avoid: "Alimentos que no te gustan o evitas", context: "Contexto útil", contextHint: "Horarios, rutinas o lo que ayude. No añadas información que no quieras que utilice el asesor.", consent: "Acepto expresamente que Viste.ai almacene y procese mis datos de alimentación y peso para ofrecerme esta experiencia privada de acompañamiento.", saveProfile: "Guardar perfil privado", updateProfile: "Actualizar perfil", profileSaved: "Perfil guardado.",
    safetyTitle: "Acompañamiento, no tratamiento médico", safety: "Este asesor ofrece orientación general de bienestar. No diagnostica ni sustituye a un médico o dietista-nutricionista. Las situaciones urgentes o de riesgo se derivan a atención profesional.", error: "Algo no se guardó correctamente. Inténtalo de nuevo.", requiredProfile: "Completa tu perfil antes de utilizar el asesor.", breakfast: "Desayuno", lunch: "Comida", dinner: "Cena", snack: "Tentempié", other: "Otra",
  },
} as const;

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 20);
}

function localDateTimeValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function NutritionGate({ locale, configured, loading, onSignIn }: { locale: Locale; configured: boolean; loading: boolean; onSignIn: (email: string) => Promise<string | null> }) {
  const c = copy[locale];
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    const signInError = await onSignIn(email.trim());
    if (signInError) { setError(signInError); setStatus("error"); return; }
    setStatus("sent");
  }
  return <main className={styles.gate}>
    <section className={styles.gateCard}>
      <div className={styles.brand}><span aria-hidden="true"><FiActivity /></span><strong>Viste.ai</strong><small>{locale === "es" ? "Nutrición personal" : "Personal nutrition"}</small></div>
      <p className={styles.eyebrow}>{c.eyebrow}</p><h1>{c.title}</h1><p className={styles.lead}>{c.lead}</p>
      <div className={styles.trustRow}><FiShield aria-hidden="true" /><span>{c.private}</span></div>
      <form className={styles.authForm} onSubmit={submit}><label htmlFor="nutrition-email">{c.email}</label><input id="nutrition-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={c.emailPlaceholder} autoComplete="email" required /><button className={styles.primaryButton} type="submit" disabled={!configured || loading || status === "sending"}>{loading || status === "sending" ? c.loading : c.signIn}<FiChevronRight aria-hidden="true" /></button></form>
      {status === "sent" ? <p className={styles.successText} role="status">{c.linkSent}</p> : null}
      {status === "error" ? <p className={styles.inlineError} role="alert">{error}</p> : null}
      {!configured ? <p className={styles.inlineError} role="status">{c.unavailable}</p> : null}
      <div className={styles.safetyNote}><strong>{c.safetyTitle}</strong><p>{c.safety}</p></div>
    </section>
  </main>;
}

function ProfileForm({ locale, session, supabase, initial, onSaved }: { locale: Locale; session: Session; supabase: SupabaseClient; initial: NutritionProfile | null; onSaved: (profile: NutritionProfile) => void }) {
  const c = copy[locale];
  const [name, setName] = useState(initial?.display_name || session.user.user_metadata?.full_name || "");
  const [goal, setGoal] = useState<NutritionGoal>(initial?.goal || "eat_better");
  const [preferences, setPreferences] = useState(initial?.dietary_preferences.join(", ") || "");
  const [allergies, setAllergies] = useState(initial?.allergies.join(", ") || "");
  const [avoid, setAvoid] = useState(initial?.foods_to_avoid.join(", ") || "");
  const [notes, setNotes] = useState(initial?.context_notes || "");
  const [consent, setConsent] = useState(Boolean(initial?.consent_at));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!consent) return;
    setStatus("saving");
    const payload = {
      user_id: session.user.id, display_name: name.trim(), goal, dietary_preferences: splitList(preferences), allergies: splitList(allergies), foods_to_avoid: splitList(avoid), context_notes: notes.trim(), locale,
      consent_version: "nutrition-private-v1", consent_at: initial?.consent_at || new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("nutrition_profiles").upsert(payload).select("user_id,display_name,goal,dietary_preferences,allergies,foods_to_avoid,context_notes,locale,consent_at").single();
    if (error || !data) { setStatus("error"); return; }
    setStatus("saved"); onSaved(data as NutritionProfile);
  }

  return <form className={styles.profileForm} onSubmit={save}>
    <header><div className={styles.sectionIcon}><FiUser /></div><div><h2>{initial ? c.profile : c.setup}</h2><p>{c.setupLead}</p></div></header>
    <div className={styles.formGrid}>
      <label>{c.name}<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} autoComplete="name" /></label>
      <label>{c.goal}<select value={goal} onChange={(event) => setGoal(event.target.value as NutritionGoal)}>{(Object.keys(c.goals) as NutritionGoal[]).map((value) => <option value={value} key={value}>{c.goals[value]}</option>)}</select></label>
      <label>{c.preferences}<input value={preferences} onChange={(event) => setPreferences(event.target.value)} aria-describedby="preferences-help" /><small id="preferences-help">{c.preferencesHint}</small></label>
      <label>{c.allergies}<input value={allergies} onChange={(event) => setAllergies(event.target.value)} aria-describedby="allergies-help" /><small id="allergies-help">{c.allergiesHint}</small></label>
      <label>{c.avoid}<input value={avoid} onChange={(event) => setAvoid(event.target.value)} /></label>
      <label className={styles.fullField}>{c.context}<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} maxLength={1200} /><small>{c.contextHint}</small></label>
    </div>
    <label className={styles.consent}><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /><span>{c.consent}</span></label>
    <div className={styles.formActions}><button className={styles.primaryButton} type="submit" disabled={!consent || name.trim().length < 2 || status === "saving"}>{status === "saving" ? c.saving : initial ? c.updateProfile : c.saveProfile}<FiCheck aria-hidden="true" /></button>{status === "saved" ? <span className={styles.successText} role="status">{c.profileSaved}</span> : null}{status === "error" ? <span className={styles.inlineError} role="alert">{c.error}</span> : null}</div>
  </form>;
}

function NutritionDashboard({ locale, session, supabase, signOut }: { locale: Locale; session: Session; supabase: SupabaseClient; signOut: () => Promise<void> }) {
  const c = copy[locale];
  const [view, setView] = useState<View>("coach");
  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [meals, setMeals] = useState<NutritionMeal[]>([]);
  const [weights, setWeights] = useState<NutritionWeight[]>([]);
  const [messages, setMessages] = useState<NutritionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const transcript = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const [profileResult, mealsResult, weightsResult, messagesResult] = await Promise.all([
      supabase.from("nutrition_profiles").select("user_id,display_name,goal,dietary_preferences,allergies,foods_to_avoid,context_notes,locale,consent_at").maybeSingle(),
      supabase.from("nutrition_meals").select("id,eaten_at,meal_type,description,hunger_before,fullness_after").order("eaten_at", { ascending: false }).limit(30),
      supabase.from("nutrition_weights").select("id,measured_on,weight_kg,note").order("measured_on", { ascending: false }).limit(30),
      supabase.from("nutrition_messages").select("id,role,content,safety_level,created_at").order("created_at", { ascending: true }).limit(40),
    ]);
    const error = profileResult.error || mealsResult.error || weightsResult.error || messagesResult.error;
    if (error) { setLoadError(true); setLoading(false); return; }
    setProfile(profileResult.data as NutritionProfile | null);
    setMeals((mealsResult.data || []) as NutritionMeal[]);
    setWeights((weightsResult.data || []).map((entry) => ({ ...entry, weight_kg: Number(entry.weight_kg) })) as NutritionWeight[]);
    setMessages((messagesResult.data || []) as NutritionMessage[]);
    setLoading(false);
  }, [supabase]);

  // Loading the authenticated Supabase snapshot necessarily hydrates client state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { transcript.current?.scrollTo({ top: transcript.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  if (loading) return <main className={styles.loadingPage}><span className={styles.loader} /><p>{c.loading}</p></main>;
  if (loadError) return <main className={styles.loadingPage}><p className={styles.inlineError}>{c.error}</p><button className={styles.secondaryButton} onClick={() => location.reload()}>{locale === "es" ? "Reintentar" : "Try again"}</button></main>;
  if (!profile) return <main className={styles.onboarding}><div className={styles.onboardingTop}><span>Viste.ai</span><button type="button" onClick={() => void signOut()}><FiLogOut />{c.signOut}</button></div><ProfileForm locale={locale} session={session} supabase={supabase} initial={null} onSaved={setProfile} /></main>;

  const latestWeight = weights[0];
  const oldestWeight = weights.at(-1);
  const delta = latestWeight && oldestWeight && latestWeight.id !== oldestWeight.id ? Number((latestWeight.weight_kg - oldestWeight.weight_kg).toFixed(1)) : null;

  return <main className={styles.appShell}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}><span><FiActivity /></span><strong>Viste.ai</strong><small>{locale === "es" ? "Nutrición" : "Nutrition"}</small></div>
      <nav aria-label={locale === "es" ? "Navegación nutricional" : "Nutrition navigation"}>
        {([["coach", FiMessageCircle], ["log", FiBookOpen], ["progress", FiActivity], ["profile", FiUser]] as const).map(([id, Icon]) => <button type="button" key={id} data-active={view === id} onClick={() => setView(id)}><Icon aria-hidden="true" /><span>{c[id]}</span></button>)}
      </nav>
      <div className={styles.sidebarSafety}><FiShield /><p>{c.safetyTitle}</p></div>
      <button className={styles.signOut} type="button" onClick={() => void signOut()}><FiLogOut />{c.signOut}</button>
    </aside>
    <section className={styles.workspace}>
      <header className={styles.topbar}><div><p>{c.eyebrow}</p><h1>{c.hello}, {profile.display_name}</h1></div><span className={styles.goalPill}><FiTarget />{c.goals[profile.goal]}</span></header>
      {view === "coach" ? <CoachView locale={locale} session={session} meals={meals} weights={weights} messages={messages} setMessages={setMessages} transcript={transcript} /> : null}
      {view === "log" ? <LogView locale={locale} session={session} supabase={supabase} meals={meals} setMeals={setMeals} /> : null}
      {view === "progress" ? <ProgressView locale={locale} session={session} supabase={supabase} weights={weights} setWeights={setWeights} latestWeight={latestWeight} delta={delta} /> : null}
      {view === "profile" ? <ProfileForm locale={locale} session={session} supabase={supabase} initial={profile} onSaved={setProfile} /> : null}
    </section>
    <nav className={styles.mobileNav} aria-label={locale === "es" ? "Navegación nutricional" : "Nutrition navigation"}>{([["coach", FiMessageCircle], ["log", FiBookOpen], ["progress", FiActivity], ["profile", FiUser]] as const).map(([id, Icon]) => <button type="button" key={id} data-active={view === id} onClick={() => setView(id)}><Icon /><span>{c[id]}</span></button>)}</nav>
  </main>;
}

function CoachView({ locale, session, meals, weights, messages, setMessages, transcript }: { locale: Locale; session: Session; meals: NutritionMeal[]; weights: NutritionWeight[]; messages: NutritionMessage[]; setMessages: React.Dispatch<React.SetStateAction<NutritionMessage[]>>; transcript: React.RefObject<HTMLDivElement | null> }) {
  const c = copy[locale]; const [draft, setDraft] = useState(""); const [sending, setSending] = useState(false); const [error, setError] = useState(false);
  const send = async (event: React.FormEvent) => {
    event.preventDefault(); const message = draft.trim(); if (message.length < 2 || sending) return;
    const optimistic: NutritionMessage = { id: crypto.randomUUID(), role: "user", content: message, safety_level: "general", created_at: new Date().toISOString() };
    setDraft(""); setError(false); setSending(true); setMessages((current) => [...current, optimistic]);
    try {
      const response = await fetch("/api/nutrition/chat", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ locale, message }) });
      const result = await response.json() as NutritionReply | { error?: string };
      if (!response.ok || !("reply" in result)) throw new Error("nutrition-chat-failed");
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: result.reply, safety_level: result.safetyLevel, created_at: new Date().toISOString() }]);
    } catch { setDraft(message); setError(true); } finally { setSending(false); }
  };
  return <div className={styles.coachGrid}>
    <section className={styles.chatCard}><header><div className={styles.coachAvatar}><FiActivity /></div><div><strong>{locale === "es" ? "Tu asesor personal" : "Your personal coach"}</strong><span>{locale === "es" ? "Conoce tu perfil y tus registros" : "Uses your profile and logs"}</span></div></header><div className={styles.transcript} ref={transcript} aria-live="polite">{messages.length === 0 ? <div className={styles.emptyCoach}><FiMessageCircle /><p>{c.chatEmpty}</p></div> : messages.map((message) => <div className={message.role === "assistant" ? styles.assistantMessage : styles.userMessage} key={message.id}><p>{message.content}</p></div>)}{sending ? <div className={styles.assistantMessage}><p>{c.thinking}</p></div> : null}</div><form className={styles.chatComposer} onSubmit={send}><label htmlFor="nutrition-message">{c.ask}</label><div><textarea id="nutrition-message" rows={2} value={draft} maxLength={1200} placeholder={c.placeholder} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><button type="submit" disabled={sending || draft.trim().length < 2}>{c.send}<FiChevronRight /></button></div>{error ? <span className={styles.inlineError} role="alert">{c.error}</span> : null}</form></section>
    <aside className={styles.contextRail}><section><span>{c.today}</span><strong>{meals.length ? meals[0].description : c.noMeals}</strong></section><section><span>{c.latestWeight}</span><strong>{weights[0] ? `${weights[0].weight_kg} ${c.kg}` : c.noTrend}</strong></section><div className={styles.safetyNote}><strong>{c.safetyTitle}</strong><p>{c.safety}</p></div></aside>
  </div>;
}

function LogView({ locale, session, supabase, meals, setMeals }: { locale: Locale; session: Session; supabase: SupabaseClient; meals: NutritionMeal[]; setMeals: React.Dispatch<React.SetStateAction<NutritionMeal[]>> }) {
  const c = copy[locale]; const [mealType, setMealType] = useState<NutritionMealType>("lunch"); const [eatenAt, setEatenAt] = useState(localDateTimeValue); const [description, setDescription] = useState(""); const [hunger, setHunger] = useState(""); const [fullness, setFullness] = useState(""); const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  async function save(event: React.FormEvent) { event.preventDefault(); setStatus("saving"); const payload = { user_id: session.user.id, meal_type: mealType, eaten_at: new Date(eatenAt).toISOString(), description: description.trim(), hunger_before: hunger ? Number(hunger) : null, fullness_after: fullness ? Number(fullness) : null }; const { data, error } = await supabase.from("nutrition_meals").insert(payload).select("id,eaten_at,meal_type,description,hunger_before,fullness_after").single(); if (error || !data) { setStatus("error"); return; } setMeals((current) => [data as NutritionMeal, ...current]); setDescription(""); setHunger(""); setFullness(""); setStatus("idle"); }
  return <div className={styles.dataGrid}><form className={styles.entryForm} onSubmit={save}><header><div className={styles.sectionIcon}><FiPlus /></div><div><h2>{c.addMeal}</h2><p>{locale === "es" ? "Describe la comida con tus palabras; no hace falta pesar todo." : "Describe the meal in your own words; you do not need to weigh everything."}</p></div></header><div className={styles.formGrid}><label>{c.mealType}<select value={mealType} onChange={(event) => setMealType(event.target.value as NutritionMealType)}>{(["breakfast", "lunch", "dinner", "snack", "other"] as NutritionMealType[]).map((type) => <option value={type} key={type}>{c[type]}</option>)}</select></label><label>{c.eatenAt}<input type="datetime-local" value={eatenAt} onChange={(event) => setEatenAt(event.target.value)} required /></label><label className={styles.fullField}>{c.description}<textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} placeholder={c.mealPlaceholder} minLength={2} maxLength={1200} required /></label><label>{c.hunger}<input type="number" min="1" max="10" inputMode="numeric" value={hunger} onChange={(event) => setHunger(event.target.value)} /></label><label>{c.fullness}<input type="number" min="1" max="10" inputMode="numeric" value={fullness} onChange={(event) => setFullness(event.target.value)} /></label></div><button className={styles.primaryButton} type="submit" disabled={status === "saving" || description.trim().length < 2}>{status === "saving" ? c.saving : c.saveMeal}<FiCheck /></button>{status === "error" ? <span className={styles.inlineError}>{c.error}</span> : null}</form><section className={styles.historyCard}><header><h2>{c.recent}</h2><span>{meals.length}</span></header>{meals.length ? <div className={styles.mealList}>{meals.map((meal) => <article key={meal.id}><span>{c[meal.meal_type]}</span><strong>{meal.description}</strong><time>{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(meal.eaten_at))}</time></article>)}</div> : <div className={styles.emptyState}><FiBookOpen /><p>{c.noMeals}</p></div>}</section></div>;
}

function ProgressView({ locale, session, supabase, weights, setWeights, latestWeight, delta }: { locale: Locale; session: Session; supabase: SupabaseClient; weights: NutritionWeight[]; setWeights: React.Dispatch<React.SetStateAction<NutritionWeight[]>>; latestWeight?: NutritionWeight; delta: number | null }) {
  const c = copy[locale]; const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)); const [weight, setWeight] = useState(""); const [note, setNote] = useState(""); const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  async function save(event: React.FormEvent) { event.preventDefault(); setStatus("saving"); const payload = { user_id: session.user.id, measured_on: date, weight_kg: Number(weight), note: note.trim() }; const { data, error } = await supabase.from("nutrition_weights").upsert(payload, { onConflict: "user_id,measured_on" }).select("id,measured_on,weight_kg,note").single(); if (error || !data) { setStatus("error"); return; } const entry = { ...data, weight_kg: Number(data.weight_kg) } as NutritionWeight; setWeights((current) => [entry, ...current.filter((item) => item.measured_on !== entry.measured_on)].sort((a, b) => b.measured_on.localeCompare(a.measured_on))); setWeight(""); setNote(""); setStatus("idle"); }
  return <div className={styles.progressGrid}><div className={styles.metricRow}><article><span>{c.latestWeight}</span><strong>{latestWeight ? `${latestWeight.weight_kg} ${c.kg}` : "—"}</strong></article><article><span>{c.change}</span><strong>{delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta} ${c.kg}`}</strong></article><article><span>{c.entries}</span><strong>{weights.length}</strong></article></div><div className={styles.dataGrid}><form className={styles.entryForm} onSubmit={save}><header><div className={styles.sectionIcon}><FiActivity /></div><div><h2>{c.addWeight}</h2><p>{locale === "es" ? "Regístralo en condiciones parecidas y mira la tendencia, no un solo día." : "Record it under similar conditions and look at the trend, not one day."}</p></div></header><div className={styles.formGrid}><label>{c.date}<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><label>{c.weight}<input type="number" min="25" max="350" step="0.1" inputMode="decimal" value={weight} onChange={(event) => setWeight(event.target.value)} required /></label><label className={styles.fullField}>{c.note}<input value={note} maxLength={300} onChange={(event) => setNote(event.target.value)} /></label></div><button className={styles.primaryButton} type="submit" disabled={status === "saving" || !weight}>{status === "saving" ? c.saving : c.saveWeight}<FiCheck /></button>{status === "error" ? <span className={styles.inlineError}>{c.error}</span> : null}</form><section className={styles.historyCard}><header><h2>{c.progress}</h2><span>{weights.length}</span></header>{weights.length ? <div className={styles.weightList}>{weights.map((entry) => <article key={entry.id}><time>{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(`${entry.measured_on}T12:00:00`))}</time><strong>{entry.weight_kg} {c.kg}</strong><span>{entry.note}</span></article>)}</div> : <div className={styles.emptyState}><FiActivity /><p>{c.noWeights}</p></div>}</section></div></div>;
}

export function NutritionApp({ locale }: { locale: Locale }) {
  const auth = useNutritionAuth();
  const signIn = (email: string) => auth.signInWithEmail(email, locale);
  if (!auth.session || !auth.supabase) return <NutritionGate locale={locale} configured={auth.configured} loading={auth.loading} onSignIn={signIn} />;
  return <NutritionDashboard locale={locale} session={auth.session} supabase={auth.supabase} signOut={auth.signOut} />;
}
