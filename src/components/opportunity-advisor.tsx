"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildOpportunityBrief, classifyIntent, type OpportunitySubmission } from "@/lib/opportunity-engine";
import { recordOpportunityEvent } from "@/lib/opportunity-analytics";
import { publicConfig } from "@/lib/public-config";
import { TurnstileWidget } from "./turnstile-widget";

type Locale = "en" | "es";
type Result = { reference: string; bookingUrl?: string; service: { label: string; href: string }; nextAction: string };
type Draft = Omit<OpportunitySubmission, "consent" | "consentWording" | "sourceUrl" | "referrer" | "utmSource" | "utmMedium" | "utmCampaign" | "utmTerm" | "utmContent" | "gclid" | "faxNumber" | "turnstileToken" | "startedAt">;

const copy = {
  en: {
    disclosure: "I’m the Viste.ai Opportunity Advisor, an AI assistant. Tell me which workflow should work better. I’ll ask a few focused questions, suggest a sensible next step and prepare a concise brief for a senior Viste.ai practitioner if there is a strong fit.",
    steps: ["Starting point", "Current workflow", "Impact", "Systems and readiness", "Ownership and timing", "Preliminary brief", "Human handoff"],
    need: "Which workflow should work better?",
    needHint: "Describe the operational problem in your own words. Do not include passwords, payment data or confidential client information.",
    process: "How does the work happen today?",
    users: "Who is affected?",
    volume: "How often does it happen?",
    impact: "What business impact does the current process create?",
    outcome: "What measurable outcome should change?",
    systems: "Which systems and channels are involved?",
    data: "How ready are the approved data or knowledge sources?",
    owner: "Is there a named process owner?",
    access: "Can the relevant stakeholders participate?",
    timeline: "When does a decision matter?",
    commercial: "How ready is the organisation to fund a scoped next step?",
    risk: "What is the workflow risk level?",
    constraints: "Known constraints or sensitivities (optional)",
    continue: "Continue",
    back: "Back",
    prepare: "Prepare the human handoff",
    send: "Send my Opportunity Brief",
    sending: "Sending securely…",
    preliminary: "Preliminary Opportunity Brief",
    preliminaryNote: "This score is deterministic decision support, not a quotation, guarantee or delivery commitment. A Viste.ai practitioner validates the recommendation.",
    score: "Fit score",
    priority: "Priority route",
    service: "Recommended service",
    next: "Recommended next action",
    missing: "Evidence still needed",
    contactLead: "You have received the preliminary recommendation. Share contact details only if you want Viste.ai to review and respond.",
    name: "Name",
    email: "Work email",
    company: "Company",
    region: "Country / region",
    consent: "I agree that Viste.ai may use this information to respond to and qualify my enquiry under the privacy notice.",
    success: "Your Opportunity Brief is ready for human review.",
    reference: "Reference",
    book: "Book a confirmed discovery session",
    emailFallback: "Email Viste.ai",
    error: "We could not securely store the brief. Please try again or email hello@viste.ai.",
  },
  es: {
    disclosure: "Soy el Asesor de Oportunidades de Viste.ai, un asistente de IA. Cuéntame qué flujo debería funcionar mejor. Haré unas preguntas concretas, sugeriré un siguiente paso sensato y prepararé un breve resumen para un profesional senior de Viste.ai si existe buen encaje.",
    steps: ["Punto de partida", "Flujo actual", "Impacto", "Sistemas y preparación", "Responsables y plazo", "Brief preliminar", "Traspaso humano"],
    need: "¿Qué flujo debería funcionar mejor?",
    needHint: "Describe el problema operativo con tus palabras. No incluyas contraseñas, datos de pago ni información confidencial de clientes.",
    process: "¿Cómo funciona el trabajo actualmente?",
    users: "¿A quién afecta?",
    volume: "¿Con qué frecuencia ocurre?",
    impact: "¿Qué impacto genera el proceso actual?",
    outcome: "¿Qué resultado medible debería cambiar?",
    systems: "¿Qué sistemas y canales intervienen?",
    data: "¿Qué preparación tienen las fuentes aprobadas de datos o conocimiento?",
    owner: "¿Hay una persona responsable del proceso?",
    access: "¿Pueden participar las personas relevantes?",
    timeline: "¿Cuándo importa tomar una decisión?",
    commercial: "¿Qué preparación existe para financiar un siguiente paso acotado?",
    risk: "¿Qué nivel de riesgo tiene el flujo?",
    constraints: "Restricciones o sensibilidades conocidas (opcional)",
    continue: "Continuar",
    back: "Atrás",
    prepare: "Preparar el traspaso humano",
    send: "Enviar mi Brief de Oportunidad",
    sending: "Enviando de forma segura…",
    preliminary: "Brief de Oportunidad preliminar",
    preliminaryNote: "Esta puntuación es apoyo determinista para decidir, no un presupuesto, garantía ni compromiso de entrega. Un profesional de Viste.ai valida la recomendación.",
    score: "Puntuación de encaje",
    priority: "Ruta de prioridad",
    service: "Servicio recomendado",
    next: "Siguiente acción recomendada",
    missing: "Evidencia pendiente",
    contactLead: "Ya has recibido la recomendación preliminar. Comparte tus datos solo si quieres que Viste.ai la revise y responda.",
    name: "Nombre",
    email: "Email profesional",
    company: "Empresa",
    region: "País / región",
    consent: "Acepto que Viste.ai use estos datos para responder y cualificar mi consulta según el aviso de privacidad.",
    success: "Tu Brief de Oportunidad está listo para revisión humana.",
    reference: "Referencia",
    book: "Reservar una sesión de diagnóstico confirmada",
    emailFallback: "Escribir a Viste.ai",
    error: "No pudimos guardar el brief de forma segura. Inténtalo de nuevo o escribe a hello@viste.ai.",
  },
} as const;

const levelOptions = {
  en: [["none", "Not available"], ["low", "Early / uncertain"], ["medium", "Partly ready"], ["high", "Ready and confirmed"]],
  es: [["none", "No disponible"], ["low", "Inicial / incierto"], ["medium", "Parcialmente preparado"], ["high", "Preparado y confirmado"]],
} as const;

const initialDraft = (locale: Locale): Draft => ({
  locale, initialNeed: "", currentProcess: "", affectedUsers: "", volume: "weekly", businessImpact: "", desiredOutcome: "", systems: "",
  dataReadiness: "medium", processOwnership: "medium", stakeholderAccess: "medium", timeline: "quarter", commercialReadiness: "medium",
  risk: "LOW", constraints: "", name: "", email: "", company: "", region: "",
});

function previewInput(draft: Draft): OpportunitySubmission {
  return { ...draft, consent: true, consentWording: "Preview only; consent is captured before persistence.", sourceUrl: "https://viste.ai/advisor", referrer: "", utmSource: "", utmMedium: "", utmCampaign: "", utmTerm: "", utmContent: "", gclid: "", faxNumber: "", turnstileToken: "", startedAt: 1 };
}

export function OpportunityAdvisor({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => initialDraft(locale));
  const [consent, setConsent] = useState(false);
  const [faxNumber, setFaxNumber] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error" | "success">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const startedAt = useRef(0);
  const viewed = useRef(false);
  const classification = useMemo(() => classifyIntent(`${draft.initialNeed}\n${draft.currentProcess}\n${draft.systems}`), [draft.initialNeed, draft.currentProcess, draft.systems]);
  const brief = useMemo(() => step >= 5 ? buildOpportunityBrief(previewInput(draft)) : null, [draft, step]);
  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), []);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    recordOpportunityEvent("advisor_viewed", { locale });
  }, [locale]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((current) => ({ ...current, [key]: value })); }

  function canContinue() {
    if (step === 0) return draft.initialNeed.trim().length >= 20;
    if (step === 1) return draft.currentProcess.trim().length >= 20 && draft.affectedUsers.trim().length >= 2;
    if (step === 2) return draft.businessImpact.trim().length >= 15 && draft.desiredOutcome.trim().length >= 15;
    if (step === 3) return draft.systems.trim().length >= 2;
    return true;
  }

  function advance() {
    const intent = classification.intent;
    if (step === 0) recordOpportunityEvent("advisor_started", { locale, step, intent });
    recordOpportunityEvent("advisor_step_completed", { locale, step, intent });
    if (step === 4) recordOpportunityEvent("advisor_brief_viewed", { locale, step: 5, intent });
    if (step === 5) recordOpportunityEvent("advisor_handoff_started", { locale, step: 6, intent });
    setStep((value) => value + 1);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!consent) return;
    setState("sending");
    const query = new URLSearchParams(location.search);
    const consentWording = c.consent;
    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...draft, consent, consentWording, sourceUrl: location.href, referrer: document.referrer, utmSource: query.get("utm_source") || "", utmMedium: query.get("utm_medium") || "", utmCampaign: query.get("utm_campaign") || "", utmTerm: query.get("utm_term") || "", utmContent: query.get("utm_content") || "", gclid: query.get("gclid") || "", faxNumber, turnstileToken, startedAt: startedAt.current || Date.now() - 3_000 }),
      });
      const payload = await response.json().catch(() => null) as (Result & { score: number; priority: string; confidence: number; risk: string; stage: string; missingInformation: string[] }) | null;
      if (!response.ok || !payload?.reference) throw new Error("delivery-failed");
      setResult(payload);
      setState("success");
    } catch {
      setState("error");
    }
  }

  if (state === "success" && result) return <section className="advisor-success" role="status" aria-live="polite">
    <span aria-hidden="true">✓</span><p className="eyebrow">VIS_010 · {c.reference} {result.reference.slice(0, 8)}</p><h2>{c.success}</h2><p>{result.nextAction}</p>
    <div className="advisor-result-actions"><Link className="button button-ghost" href={result.service.href}>{result.service.label}</Link>{result.bookingUrl ? <a className="button" href={result.bookingUrl} target="_blank" rel="noreferrer">{c.book}</a> : <a className="button" href="mailto:hello@viste.ai">{c.emailFallback}</a>}</div>
  </section>;

  return <form className="advisor-console" onSubmit={submit} onFocusCapture={() => { if (!startedAt.current) startedAt.current = Date.now(); }}>
    <div className="advisor-progress"><div><span>VIS_010</span><strong>{c.steps[step]}</strong></div><progress max={c.steps.length} value={step + 1}>{step + 1}</progress></div>
    <div className="advisor-disclosure"><span aria-hidden="true">AI</span><p>{c.disclosure}</p></div>

    {step === 0 ? <fieldset><legend>{c.need}</legend><p>{c.needHint}</p><textarea aria-label={c.need} value={draft.initialNeed} onChange={(event) => update("initialNeed", event.target.value)} minLength={20} maxLength={2500} rows={6} autoFocus /><p className="advisor-signal">{draft.initialNeed.length >= 20 ? `${locale === "es" ? "Señal preliminar" : "Preliminary signal"}: ${classification.intent.replaceAll("_", " ")}` : ""}</p></fieldset> : null}

    {step === 1 ? <fieldset><legend>{c.process}</legend><label>{c.process}<textarea value={draft.currentProcess} onChange={(event) => update("currentProcess", event.target.value)} minLength={20} maxLength={2500} rows={5} /></label><div className="advisor-grid"><label>{c.users}<input value={draft.affectedUsers} onChange={(event) => update("affectedUsers", event.target.value)} /></label><label>{c.volume}<select value={draft.volume} onChange={(event) => update("volume", event.target.value as Draft["volume"])}><option value="occasional">{locale === "es" ? "Unas veces al mes" : "A few times a month"}</option><option value="weekly">{locale === "es" ? "Cada semana" : "Every week"}</option><option value="daily">{locale === "es" ? "Cada día" : "Every day"}</option><option value="high">{locale === "es" ? "Volumen alto" : "High volume"}</option></select></label></div></fieldset> : null}

    {step === 2 ? <fieldset><legend>{c.impact}</legend><label>{c.impact}<textarea value={draft.businessImpact} onChange={(event) => update("businessImpact", event.target.value)} minLength={15} rows={5} /></label><label>{c.outcome}<textarea value={draft.desiredOutcome} onChange={(event) => update("desiredOutcome", event.target.value)} minLength={15} rows={5} /></label></fieldset> : null}

    {step === 3 ? <fieldset><legend>{c.systems}</legend><label>{c.systems}<textarea value={draft.systems} onChange={(event) => update("systems", event.target.value)} rows={5} /></label><label>{c.data}<select value={draft.dataReadiness} onChange={(event) => update("dataReadiness", event.target.value as Draft["dataReadiness"])}>{levelOptions[locale].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></fieldset> : null}

    {step === 4 ? <fieldset><legend>{locale === "es" ? "Responsables, plazo y control" : "Ownership, timing and control"}</legend><div className="advisor-grid"><label>{c.owner}<select value={draft.processOwnership} onChange={(event) => update("processOwnership", event.target.value as Draft["processOwnership"])}>{levelOptions[locale].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>{c.access}<select value={draft.stakeholderAccess} onChange={(event) => update("stakeholderAccess", event.target.value as Draft["stakeholderAccess"])}>{levelOptions[locale].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>{c.timeline}<select value={draft.timeline} onChange={(event) => update("timeline", event.target.value as Draft["timeline"])}><option value="planning">{locale === "es" ? "Planificación" : "Planning"}</option><option value="six_months">3–6 {locale === "es" ? "meses" : "months"}</option><option value="quarter">{locale === "es" ? "Este trimestre" : "This quarter"}</option><option value="thirty_days">{locale === "es" ? "30 días" : "30 days"}</option></select></label><label>{c.commercial}<select value={draft.commercialReadiness} onChange={(event) => update("commercialReadiness", event.target.value as Draft["commercialReadiness"])}>{levelOptions[locale].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>{c.risk}<select value={draft.risk} onChange={(event) => update("risk", event.target.value as Draft["risk"])}><option value="LOW">{locale === "es" ? "Bajo" : "Low"}</option><option value="MEDIUM">{locale === "es" ? "Medio" : "Medium"}</option><option value="HIGH">{locale === "es" ? "Alto / sensible" : "High / sensitive"}</option></select></label></div><label>{c.constraints}<textarea value={draft.constraints} onChange={(event) => update("constraints", event.target.value)} rows={3} /></label></fieldset> : null}

    {step === 5 && brief ? <section className="opportunity-brief" aria-labelledby="brief-title"><p className="eyebrow">VIS_010</p><h2 id="brief-title">{c.preliminary}</h2><p>{c.preliminaryNote}</p><div className="brief-grid"><article><span>{c.score}</span><strong>{brief.score.total}/100</strong><small>{Math.round(brief.score.confidence * 100)}% {locale === "es" ? "confianza" : "confidence"}</small></article><article><span>{c.priority}</span><strong>{brief.score.priority.replaceAll("_", " ")}</strong></article><article><span>{c.service}</span><strong>{brief.service.label}</strong></article><article><span>{c.next}</span><strong>{brief.nextAction}</strong></article></div>{brief.missingInformation.length ? <div className="brief-missing"><strong>{c.missing}</strong><ul>{brief.missingInformation.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}</section> : null}

    {step === 6 ? <fieldset><legend>{locale === "es" ? "Solicitar revisión humana" : "Request human review"}</legend><p>{c.contactLead}</p><div className="advisor-grid"><label>{c.name}<input value={draft.name} onChange={(event) => update("name", event.target.value)} required minLength={2} autoComplete="name" /></label><label>{c.email}<input value={draft.email} onChange={(event) => update("email", event.target.value)} required type="email" autoComplete="email" /></label><label>{c.company}<input value={draft.company} onChange={(event) => update("company", event.target.value)} required autoComplete="organization" /></label><label>{c.region}<input value={draft.region} onChange={(event) => update("region", event.target.value)} required autoComplete="country-name" /></label></div><label className="consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /><span>{c.consent} <Link href={locale === "es" ? "/es/privacidad" : "/privacy"}>{locale === "es" ? "Leer privacidad" : "Read privacy"}</Link>.</span></label><TurnstileWidget siteKey={publicConfig.turnstileSiteKey} locale={locale} onToken={handleTurnstileToken} /><label className="honeypot" aria-hidden="true">Fax number<input value={faxNumber} onChange={(event) => setFaxNumber(event.target.value)} tabIndex={-1} autoComplete="off" /></label>{state === "error" ? <p className="form-error" role="alert">{c.error}</p> : null}</fieldset> : null}

    <div className="advisor-actions">{step > 0 && state !== "sending" ? <button className="button button-ghost" type="button" onClick={() => setStep((value) => value - 1)}>{c.back}</button> : <span />}{step < 6 ? <button className="button" type="button" disabled={!canContinue()} onClick={advance}>{step === 5 ? c.prepare : c.continue}</button> : <button className="button" type="submit" disabled={!consent || Boolean(publicConfig.turnstileSiteKey && !turnstileToken) || state === "sending"}>{state === "sending" ? c.sending : c.send}</button>}</div>
  </form>;
}
