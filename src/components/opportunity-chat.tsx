"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { services } from "@/content/catalog";
import type { AdvisorConversationReply, AdvisorConversationStage } from "@/lib/advisor-conversation";
import { classifyIntent, type OpportunityIntent, type OpportunitySubmission } from "@/lib/opportunity-engine";
import { recordOpportunityEvent } from "@/lib/opportunity-analytics";
import { publicConfig } from "@/lib/public-config";
import { TurnstileWidget } from "./turnstile-widget";

type Locale = "en" | "es";
type Stage = AdvisorConversationStage | "contact" | "sending" | "success" | "error" | "closed";
type Result = { reference: string; bookingUrl?: string; service: { label: string; href: string }; nextAction: string };
type ChatTurn = { id: string; role: "user" | "assistant"; text: string };

const copy = {
  en: {
    hello: "Hi — I’m Viste’s AI business advisor.",
    intro: "Tell me about the business in your own words. I’ll listen for what is creating pressure, ask only what matters, and suggest a practical direction without the hard sell.",
    business: "What does your business do, and who does it serve?",
    businessPlaceholder: "For example: we manage 12 holiday properties and most guests contact us through WhatsApp…",
    goal: "What would you most like to improve?",
    goalPlaceholder: "Or describe the result you want in your own words…",
    situation: "What is getting in the way today?",
    situationPlaceholder: "For example: enquiries arrive in different places, follow-up is manual and we cannot see what is still waiting…",
    thinking: "Thinking about your business…",
    retry: "I couldn’t think that through properly just now. Please try again — your answer is still here.",
    send: "Send", back: "Back", restart: "Start again",
    brief: "What I’d explore with you", best: "Best starting point", other: "Also worth considering",
    note: "These are informed starting points, not a fixed proposal. A Viste specialist will confirm scope, timing, cost and what should stay human-led.",
    review: "Talk to Viste",
    contactIntro: "I have enough context to match this with the right Viste options. First, leave your details and complete the quick robot check. We’ll send the conversation with your enquiry, then show the relevant services and calendar without making you repeat yourself.",
    name: "Name", email: "Work email", phone: "Phone / WhatsApp (optional)", company: "Company", region: "Country / region",
    consent: "I agree that Viste.ai may use these details to respond to and qualify my enquiry under the privacy notice.",
    privacy: "Privacy", submit: "Send my details and show next steps", sending: "Sending securely…",
    success: "Thank you — Viste has your details and conversation.", successDetail: "The team has received a concise summary of what you need, the suggested service and whether a calendar slot was offered. You can choose the next step below.",
    reference: "Reference", book: "Book a time with Rupert", whatsapp: "Continue on WhatsApp", emailFallback: "Email hello@viste.ai",
    error: "We could not deliver your details. Please try again; nothing has been sent yet.",
    closed: "This conversation has been closed because there wasn’t enough relevant business context. Start again whenever you have a real business need to explore.",
    unknownSystems: "Systems and tools to be confirmed during a human review",
    compactConstraint: "AI website advisor. Final scope, commercial terms and consequential actions require human review.",
    goals: ["Win more customers", "Improve customer service", "Reduce admin work", "Connect data and reporting", "Build a website or app", "Help me choose"],
  },
  es: {
    hello: "Hola — soy el asesor de negocio con IA de Viste.",
    intro: "Cuéntame sobre la empresa con tus propias palabras. Escucharé qué está generando presión, preguntaré solo lo importante y sugeriré una dirección práctica sin venderte a la fuerza.",
    business: "¿A qué se dedica tu empresa y a quién ayuda?",
    businessPlaceholder: "Por ejemplo: gestionamos 12 alojamientos y la mayoría de los huéspedes nos contacta por WhatsApp…",
    goal: "¿Qué te gustaría mejorar principalmente?",
    goalPlaceholder: "O describe con tus propias palabras el resultado que buscas…",
    situation: "¿Qué lo está dificultando ahora mismo?",
    situationPlaceholder: "Por ejemplo: las consultas llegan por varios sitios, el seguimiento es manual y no vemos qué sigue pendiente…",
    thinking: "Pensando en tu negocio…",
    retry: "No pude analizarlo bien en este momento. Inténtalo de nuevo; tu respuesta sigue aquí.",
    send: "Enviar", back: "Atrás", restart: "Empezar de nuevo",
    brief: "Lo que exploraría contigo", best: "Mejor punto de partida", other: "También puede encajar",
    note: "Son puntos de partida razonados, no una propuesta cerrada. Un especialista de Viste confirmará alcance, plazo, coste y qué debe seguir bajo control humano.",
    review: "Hablar con Viste",
    contactIntro: "Ya tengo suficiente contexto para relacionarlo con las opciones adecuadas de Viste. Primero deja tus datos y completa la verificación anti-robot. Enviaremos la conversación con la consulta y después verás los servicios relevantes y el calendario sin tener que repetirirte.",
    name: "Nombre", email: "Email profesional", phone: "Teléfono / WhatsApp (opcional)", company: "Empresa", region: "País / región",
    consent: "Acepto que Viste.ai use estos datos para responder y cualificar mi consulta según el aviso de privacidad.",
    privacy: "Privacidad", submit: "Enviar mis datos y ver los siguientes pasos", sending: "Enviando de forma segura…",
    success: "Gracias — Viste ya tiene tus datos y la conversación.", successDetail: "El equipo ha recibido un resumen claro de lo que necesitas, el servicio sugerido y si se ofreció una cita. Ya puedes elegir el siguiente paso.",
    reference: "Referencia", book: "Reservar una conversación con Rupert", whatsapp: "Continuar por WhatsApp", emailFallback: "Escribir a hello@viste.ai",
    error: "No pudimos entregar tus datos. Inténtalo de nuevo; todavía no se ha enviado nada.",
    closed: "Hemos cerrado esta conversación porque no había suficiente contexto empresarial relevante. Puedes empezar de nuevo cuando tengas una necesidad real del negocio que explorar.",
    unknownSystems: "Sistemas y herramientas por confirmar durante la revisión humana",
    compactConstraint: "Asesor web con IA. El alcance final, las condiciones y las acciones importantes requieren revisión humana.",
    goals: ["Conseguir más clientes", "Mejorar la atención al cliente", "Reducir trabajo administrativo", "Conectar datos e informes", "Crear una web o aplicación", "Ayúdame a elegir"],
  },
} as const;

function baseSubmission(locale: Locale, business: string, goal: string, situation: string): OpportunitySubmission {
  const c = copy[locale];
  const safeBusiness = business || (locale === "es" ? "El contexto del negocio se confirmará durante la revisión humana" : "The business context will be confirmed during the human review");
  const safeGoal = goal || (locale === "es" ? "Explorar una mejora práctica para el negocio" : "Explore a practical improvement for the business");
  const safeSituation = situation || (locale === "es" ? "La situación actual se confirmará durante la revisión humana" : "The current situation will be confirmed during the human review");
  return {
    locale,
    initialNeed: `${safeBusiness}. ${locale === "es" ? "Prioridad principal" : "Main priority"}: ${safeGoal}.`,
    currentProcess: `${safeSituation}. ${locale === "es" ? "Contexto del negocio" : "Business context"}: ${safeBusiness}.`,
    affectedUsers: locale === "es" ? "El equipo de la empresa y sus clientes" : "The business team and its customers",
    volume: "weekly",
    businessImpact: `${safeGoal}. ${safeSituation}`,
    desiredOutcome: `${safeGoal}. ${locale === "es" ? "El resultado exacto se acordará con el equipo." : "The exact outcome will be agreed with the team."}`,
    systems: c.unknownSystems,
    dataReadiness: "low", processOwnership: "medium", stakeholderAccess: "medium", timeline: "planning", commercialReadiness: "medium", risk: "LOW",
    constraints: c.compactConstraint,
    advisorTranscript: "",
    name: "Pending human review", email: "pending@example.invalid", phone: "", company: "Pending human review", region: "Not confirmed",
    consent: true, consentWording: c.consent, sourceUrl: "https://viste.ai/advisor", referrer: "",
    utmSource: "", utmMedium: "", utmCampaign: "", utmTerm: "", utmContent: "", gclid: "", faxNumber: "", turnstileToken: "", startedAt: 1,
  };
}

const primaryService: Record<OpportunityIntent, string> = {
  AI_EXPLORATION: "opportunity-sprint", WHATSAPP_OPERATIONS: "customer-service-whatsapp", SUPPORT_AUTOMATION: "customer-service-whatsapp",
  KNOWLEDGE_ASSISTANT: "knowledge-assistants", DOCUMENT_WORKFLOW: "workflow-automation", SALES_CRM: "sales-crm-automation",
  DATA_INTELLIGENCE: "data-intelligence", CUSTOM_PRODUCT: "website-app-development", PARTNER: "custom-ai-development",
  EXISTING_CLIENT: "opportunity-sprint", NOT_FIT: "opportunity-sprint",
};

const relatedServices: Record<OpportunityIntent, string[]> = {
  AI_EXPLORATION: ["website-app-development", "workflow-automation"], WHATSAPP_OPERATIONS: ["sales-crm-automation", "knowledge-assistants"],
  SUPPORT_AUTOMATION: ["knowledge-assistants", "workflow-automation"], KNOWLEDGE_ASSISTANT: ["workflow-automation", "custom-ai-development"],
  DOCUMENT_WORKFLOW: ["data-intelligence", "custom-ai-development"], SALES_CRM: ["customer-service-whatsapp", "website-app-development"],
  DATA_INTELLIGENCE: ["workflow-automation", "custom-ai-development"], CUSTOM_PRODUCT: ["workflow-automation", "sales-crm-automation"],
  PARTNER: ["opportunity-sprint", "website-app-development"], EXISTING_CLIENT: ["custom-ai-development", "workflow-automation"],
  NOT_FIT: ["website-app-development", "workflow-automation"],
};

export function OpportunityChat({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [stage, setStage] = useState<Stage>("business");
  const [draft, setDraft] = useState("");
  const [business, setBusiness] = useState("");
  const [goal, setGoal] = useState("");
  const [situation, setSituation] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [pending, setPending] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [advisorIntent, setAdvisorIntent] = useState<OpportunityIntent>("AI_EXPLORATION");
  const [contact, setContact] = useState({ name: "", email: "", phone: "", company: "", region: "" });
  const [consent, setConsent] = useState(false);
  const [faxNumber, setFaxNumber] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const startedAt = useRef(0);
  const transcriptEnd = useRef<HTMLDivElement>(null);
  const submission = useMemo(() => baseSubmission(locale, business, goal, situation), [business, goal, locale, situation]);
  const classification = useMemo(() => classifyIntent(`${business} ${goal} ${situation}`), [business, goal, situation]);
  const resolvedIntent = advisorIntent === "AI_EXPLORATION" ? classification.intent : advisorIntent;
  const conversationText = `${business} ${goal} ${situation}`.toLocaleLowerCase();
  const localWebsiteNeed = /\b(?:website|web site|site|p[aá]gina web|sitio web)\b/i.test(conversationText)
    && /\b(?:local business|restaurant|cafe|café|salon|shop|clinic|negocio local|restaurante|tienda|peluquer[ií]a|cl[ií]nica)\b/i.test(conversationText);
  const recommendations = useMemo(() => {
    const ids = localWebsiteNeed
      ? ["local-business-websites", "website-app-development", "sales-crm-automation"]
      : [primaryService[resolvedIntent], ...relatedServices[resolvedIntent]];
    return ids.map((id) => services.find((service) => service.id === id)).filter((service): service is (typeof services)[number] => Boolean(service));
  }, [localWebsiteNeed, resolvedIntent]);
  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), []);

  useEffect(() => {
    startedAt.current = Date.now();
    recordOpportunityEvent("advisor_viewed", { locale });
  }, [locale]);

  useEffect(() => {
    transcriptEnd.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [pending, stage, turns]);

  async function sendAdvisorTurn(turnStage: AdvisorConversationStage, value = draft) {
    const answer = value.trim();
    if (answer.length < 2 || pending) return;
    if (!startedAt.current) startedAt.current = Date.now();
    if (!turns.length) recordOpportunityEvent("advisor_started", { locale, step: 0, intent: classification.intent });
    setTurns((current) => [...current, { id: crypto.randomUUID(), role: "user", text: answer }]);
    setDraft("");
    setPending(true);
    try {
      const response = await fetch("/api/advisor/reply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, stage: turnStage, answer, recoveryAttempts, context: { business, goal, situation } }),
      });
      const payload = await response.json().catch(() => null) as AdvisorConversationReply | null;
      if (!response.ok || !payload?.reply) throw new Error("advisor-reply-failed");
      setTurns((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: payload.reply }]);
      if (payload.normalizedAnswer) {
        if (turnStage === "business") setBusiness(payload.normalizedAnswer);
        if (turnStage === "goal") setGoal(payload.normalizedAnswer);
        if (turnStage === "situation") setSituation(payload.normalizedAnswer);
      }
      setAdvisorIntent(payload.intent);
      setRecoveryAttempts(payload.quality === "accepted" ? 0 : Math.min(2, recoveryAttempts + 1));
      if (payload.nextStage === "ready") {
        recordOpportunityEvent("advisor_handoff_started", { locale, step: 3, intent: payload.intent });
        setStage("contact");
      } else if (payload.nextStage === "contact") {
        recordOpportunityEvent("advisor_handoff_started", { locale, step: 4, intent: payload.intent });
        setStage("contact");
      } else if (payload.nextStage === "closed") {
        setStage("closed");
      } else {
        if (payload.nextStage !== turnStage) recordOpportunityEvent("advisor_step_completed", { locale, step: turnStage === "business" ? 0 : turnStage === "goal" ? 1 : 2, intent: payload.intent });
        setStage(payload.nextStage);
      }
    } catch {
      setDraft(answer);
      setTurns((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: c.retry }]);
    } finally { setPending(false); }
  }

  function restart() {
    setStage("business"); setDraft(""); setBusiness(""); setGoal(""); setSituation(""); setTurns([]); setPending(false);
    setAdvisorIntent("AI_EXPLORATION"); setRecoveryAttempts(0); setContact({ name: "", email: "", phone: "", company: "", region: "" });
    setConsent(false); setFaxNumber(""); setTurnstileToken(""); setResult(null); startedAt.current = Date.now();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!consent) return;
    setStage("sending");
    const query = new URLSearchParams(location.search);
    try {
      const response = await fetch("/api/opportunities", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...submission, ...contact,
          advisorTranscript: turns.map((turn) => `${turn.role === "assistant" ? "Viste Advisor" : "Visitor"}: ${turn.text}`).join("\n\n").slice(0, 8_000),
          consent, consentWording: c.consent, sourceUrl: location.href, referrer: document.referrer,
          utmSource: query.get("utm_source") || "", utmMedium: query.get("utm_medium") || "", utmCampaign: query.get("utm_campaign") || "",
          utmTerm: query.get("utm_term") || "", utmContent: query.get("utm_content") || "", gclid: query.get("gclid") || "",
          faxNumber, turnstileToken, startedAt: startedAt.current || Date.now() - 3_000,
        }),
      });
      const payload = await response.json().catch(() => null) as Result | null;
      if (!response.ok || !payload?.reference) throw new Error("delivery-failed");
      setResult(payload); setStage("success");
    } catch { setStage("error"); }
  }

  const canSubmitContact = contact.name.trim().length >= 2 && contact.email.includes("@") && contact.company.trim().length >= 2 && contact.region.trim().length >= 2 && consent && (!publicConfig.turnstileSiteKey || Boolean(turnstileToken));
  const activeQuestion = stage === "business" ? c.business : c.situation;
  const activePlaceholder = stage === "business" ? c.businessPlaceholder : c.situationPlaceholder;
  const showBrief = stage === "success" && Boolean(business && goal && situation);

  return <div className="advisor-chat">
    <div className="advisor-chat-transcript" aria-live="polite">
      <div className="chat-row chat-row-ai"><span aria-hidden="true">AI</span><div><strong>{c.hello}</strong><p>{c.intro}</p></div></div>
      {turns.map((turn) => <div className={`chat-row chat-row-${turn.role === "assistant" ? "ai" : "user"}`} key={turn.id}>{turn.role === "assistant" ? <span aria-hidden="true">AI</span> : null}<div><p>{turn.text}</p></div></div>)}
      {pending ? <div className="chat-row chat-row-ai chat-row-thinking"><span aria-hidden="true">AI</span><div><p>{c.thinking}<b aria-hidden="true">•••</b></p></div></div> : null}
      {showBrief ? <div className="chat-brief chat-sales-brief">
        <span>{c.brief}</span>
        {recommendations.map((service, index) => <Link href={service.path[locale]} key={service.id} className={index === 0 ? "primary" : ""}><small>{index === 0 ? c.best : c.other}</small><strong>{service.title[locale]}</strong><p>{service.description[locale]}</p></Link>)}
        <small className="chat-brief-note">{c.note}</small>
      </div> : null}
      {stage === "contact" || stage === "sending" || stage === "error" ? <div className="chat-row chat-row-ai"><span aria-hidden="true">AI</span><div><p>{c.contactIntro}</p></div></div> : null}
      {stage === "closed" ? <div className="chat-row chat-row-ai"><span aria-hidden="true">AI</span><div><p>{c.closed}</p></div></div> : null}
      {stage === "success" && result ? <div className="chat-success" role="status">
        <span aria-hidden="true">✓</span><strong>{c.success}</strong><p>{c.successDetail}</p><small>VIS_010 · {c.reference} {result.reference.slice(0, 8)}</small>
        <div>{result.bookingUrl ? <a className="chat-book-link" href={result.bookingUrl} target="_blank" rel="noreferrer">{c.book}</a> : null}<a className="chat-whatsapp-link" href={publicConfig.whatsappUrl} target="_blank" rel="noreferrer">{c.whatsapp}</a><a href="mailto:hello@viste.ai">{c.emailFallback}</a><Link href={result.service.href}>{result.service.label}</Link></div>
      </div> : null}
      <div ref={transcriptEnd} />
    </div>

    {(stage === "business" || stage === "situation") ? <div className="chat-composer">
      <label htmlFor="advisor-answer">{activeQuestion}</label>
      <textarea id="advisor-answer" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={activePlaceholder} rows={3} maxLength={1500} disabled={pending} />
      <button type="button" disabled={draft.trim().length < 2 || pending} onClick={() => sendAdvisorTurn(stage)}>{c.send}<span aria-hidden="true">↑</span></button>
    </div> : null}

    {stage === "goal" ? <div className="chat-goal-wrap">
      <div className="chat-goals" aria-label={c.goal}>{c.goals.map((option) => <button type="button" key={option} disabled={pending} onClick={() => sendAdvisorTurn("goal", option)}>{option}<span aria-hidden="true">→</span></button>)}</div>
      <div className="chat-composer chat-goal-composer"><label htmlFor="advisor-goal">{c.goalPlaceholder}</label><textarea id="advisor-goal" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={c.goalPlaceholder} rows={2} maxLength={800} disabled={pending} /><div className="chat-composer-actions"><button className="chat-back" type="button" onClick={() => setStage("business")}>{c.back}</button><button type="button" disabled={draft.trim().length < 2 || pending} onClick={() => sendAdvisorTurn("goal")}>{c.send}<span aria-hidden="true">↑</span></button></div></div>
    </div> : null}

    {stage === "contact" || stage === "sending" || stage === "error" ? <form className="chat-contact" onSubmit={submit}>
      <div><label>{c.name}<input value={contact.name} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))} required autoComplete="name" /></label><label>{c.email}<input value={contact.email} onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))} required type="email" autoComplete="email" /></label><label>{c.phone}<input value={contact.phone} onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))} type="tel" autoComplete="tel" /></label><label>{c.company}<input value={contact.company} onChange={(event) => setContact((current) => ({ ...current, company: event.target.value }))} required autoComplete="organization" /></label><label>{c.region}<input value={contact.region} onChange={(event) => setContact((current) => ({ ...current, region: event.target.value }))} required autoComplete="country-name" /></label></div>
      <label className="consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /><span>{c.consent} <Link href={locale === "es" ? "/es/privacidad" : "/privacy"}>{c.privacy}</Link>.</span></label>
      <TurnstileWidget siteKey={publicConfig.turnstileSiteKey} locale={locale} onToken={handleTurnstileToken} />
      <label className="honeypot" aria-hidden="true">Fax number<input value={faxNumber} onChange={(event) => setFaxNumber(event.target.value)} tabIndex={-1} autoComplete="off" /></label>
      {stage === "error" ? <p className="form-error" role="alert">{c.error}</p> : null}
      <div className="chat-contact-actions"><button className="chat-back" type="button" onClick={() => setStage(business ? "situation" : "business")}>{c.back}</button><button type="submit" disabled={!canSubmitContact || stage === "sending"}>{stage === "sending" ? c.sending : c.submit}</button></div>
    </form> : null}

    {stage === "success" || stage === "closed" ? <div className="chat-choices"><button type="button" onClick={restart}>{c.restart}</button></div> : null}
  </div>;
}
