"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildOpportunityBrief, classifyIntent, type OpportunitySubmission } from "@/lib/opportunity-engine";
import { recordOpportunityEvent } from "@/lib/opportunity-analytics";
import { publicConfig } from "@/lib/public-config";
import { TurnstileWidget } from "./turnstile-widget";

type Locale = "en" | "es";
type Stage = "issue" | "outcome" | "brief" | "contact" | "sending" | "success" | "error";
type Result = { reference: string; bookingUrl?: string; service: { label: string; href: string }; nextAction: string };

const copy = {
  en: {
    hello: "Hi — I’m the Viste Advisor.",
    intro: "Tell me the operational issue in plain language. I’ll suggest a practical AI starting point.",
    issue: "What’s the issue?",
    issuePlaceholder: "For example: sales enquiries sit in email and follow-up is inconsistent…",
    outcome: "What would a good result look like?",
    outcomePlaceholder: "For example: respond within 10 minutes and keep the CRM updated…",
    send: "Send",
    back: "Back",
    restart: "Start again",
    signal: "I understand this as",
    brief: "A sensible starting point",
    score: "Preliminary fit",
    note: "This is an initial recommendation. A Viste practitioner validates scope, evidence and risk before any commitment.",
    review: "Ask Viste to review",
    contactIntro: "Where should a senior practitioner reply?",
    name: "Name",
    email: "Work email",
    company: "Company",
    region: "Country / region",
    consent: "I agree that Viste.ai may use this information to respond under the privacy notice.",
    privacy: "Privacy",
    submit: "Send for review",
    sending: "Sending securely…",
    success: "Your brief is with Viste.",
    successDetail: "A senior practitioner can now review the context and respond with a grounded next step.",
    reference: "Reference",
    emailFallback: "Email Viste.ai",
    error: "We could not securely store the brief. Please try again or email hello@viste.ai.",
    unknownUsers: "People affected are not yet confirmed",
    unknownSystems: "Systems are not yet confirmed",
    compactConstraint: "Captured through the compact Advisor; operational evidence requires human validation.",
  },
  es: {
    hello: "Hola — soy el Asesor de Viste.",
    intro: "Cuéntame el problema operativo con palabras sencillas. Sugeriré un punto de partida práctico para IA.",
    issue: "¿Cuál es el problema?",
    issuePlaceholder: "Por ejemplo: las consultas comerciales quedan en el email y el seguimiento es irregular…",
    outcome: "¿Cómo sería un buen resultado?",
    outcomePlaceholder: "Por ejemplo: responder en 10 minutos y mantener el CRM actualizado…",
    send: "Enviar",
    back: "Atrás",
    restart: "Empezar de nuevo",
    signal: "Lo entiendo como",
    brief: "Un punto de partida sensato",
    score: "Encaje preliminar",
    note: "Esta es una recomendación inicial. Un profesional de Viste valida alcance, evidencia y riesgo antes de cualquier compromiso.",
    review: "Pedir revisión a Viste",
    contactIntro: "¿Dónde debería responder un profesional senior?",
    name: "Nombre",
    email: "Email profesional",
    company: "Empresa",
    region: "País / región",
    consent: "Acepto que Viste.ai use esta información para responder según el aviso de privacidad.",
    privacy: "Privacidad",
    submit: "Enviar para revisión",
    sending: "Enviando de forma segura…",
    success: "Tu brief ya está con Viste.",
    successDetail: "Un profesional senior puede revisar el contexto y responder con un siguiente paso fundamentado.",
    reference: "Referencia",
    emailFallback: "Escribir a Viste.ai",
    error: "No pudimos guardar el brief de forma segura. Inténtalo de nuevo o escribe a hello@viste.ai.",
    unknownUsers: "Las personas afectadas aún no están confirmadas",
    unknownSystems: "Los sistemas aún no están confirmados",
    compactConstraint: "Recogido mediante el Asesor compacto; la evidencia operativa requiere validación humana.",
  },
} as const;

function baseSubmission(locale: Locale, issue: string, outcome: string): OpportunitySubmission {
  const c = copy[locale];
  return {
    locale,
    initialNeed: issue,
    currentProcess: issue,
    affectedUsers: c.unknownUsers,
    volume: "weekly",
    businessImpact: outcome,
    desiredOutcome: outcome,
    systems: c.unknownSystems,
    dataReadiness: "low",
    processOwnership: "low",
    stakeholderAccess: "low",
    timeline: "planning",
    commercialReadiness: "low",
    risk: "LOW",
    constraints: c.compactConstraint,
    name: "Pending human review",
    email: "pending@example.invalid",
    company: "Pending human review",
    region: "Not confirmed",
    consent: true,
    consentWording: c.consent,
    sourceUrl: "https://viste.ai/advisor",
    referrer: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    gclid: "",
    faxNumber: "",
    turnstileToken: "",
    startedAt: 1,
  };
}

export function OpportunityChat({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [stage, setStage] = useState<Stage>("issue");
  const [issue, setIssue] = useState("");
  const [outcome, setOutcome] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", company: "", region: "" });
  const [consent, setConsent] = useState(false);
  const [faxNumber, setFaxNumber] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const startedAt = useRef(0);
  const transcriptEnd = useRef<HTMLDivElement>(null);
  const classification = useMemo(() => classifyIntent(issue), [issue]);
  const submission = useMemo(() => baseSubmission(locale, issue, outcome || (locale === "es" ? "Resultado todavía por confirmar" : "Outcome still to be confirmed")), [issue, locale, outcome]);
  const brief = useMemo(() => issue.length >= 20 && outcome.length >= 15 ? buildOpportunityBrief(submission) : null, [issue, outcome, submission]);
  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), []);

  useEffect(() => {
    startedAt.current = Date.now();
    recordOpportunityEvent("advisor_viewed", { locale });
  }, [locale]);

  useEffect(() => {
    transcriptEnd.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [stage]);

  function sendIssue() {
    if (issue.trim().length < 20) return;
    if (!startedAt.current) startedAt.current = Date.now();
    recordOpportunityEvent("advisor_started", { locale, step: 0, intent: classification.intent });
    recordOpportunityEvent("advisor_step_completed", { locale, step: 0, intent: classification.intent });
    setStage("outcome");
  }

  function sendOutcome() {
    if (outcome.trim().length < 15) return;
    recordOpportunityEvent("advisor_step_completed", { locale, step: 1, intent: classification.intent });
    recordOpportunityEvent("advisor_brief_viewed", { locale, step: 2, intent: classification.intent });
    setStage("brief");
  }

  function requestReview() {
    recordOpportunityEvent("advisor_handoff_started", { locale, step: 3, intent: classification.intent });
    setStage("contact");
  }

  function restart() {
    setIssue("");
    setOutcome("");
    setContact({ name: "", email: "", company: "", region: "" });
    setConsent(false);
    setTurnstileToken("");
    setResult(null);
    startedAt.current = Date.now();
    setStage("issue");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!brief || !consent) return;
    setStage("sending");
    const query = new URLSearchParams(location.search);
    try {
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...submission,
          ...contact,
          consent,
          consentWording: c.consent,
          sourceUrl: location.href,
          referrer: document.referrer,
          utmSource: query.get("utm_source") || "",
          utmMedium: query.get("utm_medium") || "",
          utmCampaign: query.get("utm_campaign") || "",
          utmTerm: query.get("utm_term") || "",
          utmContent: query.get("utm_content") || "",
          gclid: query.get("gclid") || "",
          faxNumber,
          turnstileToken,
          startedAt: startedAt.current || Date.now() - 3_000,
        }),
      });
      const payload = await response.json().catch(() => null) as Result | null;
      if (!response.ok || !payload?.reference) throw new Error("delivery-failed");
      setResult(payload);
      setStage("success");
    } catch {
      setStage("error");
    }
  }

  const canSubmitContact = contact.name.trim().length >= 2 && contact.email.includes("@") && contact.company.trim().length >= 2 && contact.region.trim().length >= 2 && consent && (!publicConfig.turnstileSiteKey || Boolean(turnstileToken));

  return <div className="advisor-chat">
    <div className="advisor-chat-transcript" aria-live="polite">
      <div className="chat-row chat-row-ai"><span aria-hidden="true">AI</span><div><strong>{c.hello}</strong><p>{c.intro}</p></div></div>

      {stage !== "issue" ? <div className="chat-row chat-row-user"><div><p>{issue}</p></div></div> : null}
      {stage !== "issue" ? <div className="chat-row chat-row-ai"><span aria-hidden="true">AI</span><div><p>{c.signal} <strong>{classification.intent.replaceAll("_", " ").toLowerCase()}</strong>.</p><p>{c.outcome}</p></div></div> : null}
      {!["issue", "outcome"].includes(stage) ? <div className="chat-row chat-row-user"><div><p>{outcome}</p></div></div> : null}

      {brief && ["brief", "contact", "sending", "error"].includes(stage) ? <div className="chat-brief">
        <span>{c.brief}</span>
        <strong>{brief.service.label}</strong>
        <div><b>{c.score}</b><em>{brief.score.total}/100</em></div>
        <p>{brief.nextAction}</p>
        <small>{c.note}</small>
      </div> : null}

      {stage === "contact" || stage === "sending" || stage === "error" ? <div className="chat-row chat-row-ai"><span aria-hidden="true">AI</span><div><p>{c.contactIntro}</p></div></div> : null}

      {stage === "success" && result ? <div className="chat-success" role="status">
        <span aria-hidden="true">✓</span><strong>{c.success}</strong><p>{c.successDetail}</p><small>VIS_010 · {c.reference} {result.reference.slice(0, 8)}</small>
        <div><Link href={result.service.href}>{result.service.label}</Link>{result.bookingUrl ? <a href={result.bookingUrl} target="_blank" rel="noreferrer">{result.nextAction}</a> : <a href="mailto:hello@viste.ai">{c.emailFallback}</a>}</div>
      </div> : null}
      <div ref={transcriptEnd} />
    </div>

    {stage === "issue" ? <div className="chat-composer">
      <label htmlFor="advisor-issue">{c.issue}</label>
      <textarea id="advisor-issue" value={issue} onChange={(event) => setIssue(event.target.value)} placeholder={c.issuePlaceholder} rows={3} maxLength={2500} />
      <button type="button" disabled={issue.trim().length < 20} onClick={sendIssue}>{c.send}<span aria-hidden="true">↑</span></button>
    </div> : null}

    {stage === "outcome" ? <div className="chat-composer">
      <label htmlFor="advisor-outcome">{c.outcome}</label>
      <textarea id="advisor-outcome" value={outcome} onChange={(event) => setOutcome(event.target.value)} placeholder={c.outcomePlaceholder} rows={3} maxLength={2000} />
      <div className="chat-composer-actions"><button className="chat-back" type="button" onClick={() => setStage("issue")}>{c.back}</button><button type="button" disabled={outcome.trim().length < 15} onClick={sendOutcome}>{c.send}<span aria-hidden="true">↑</span></button></div>
    </div> : null}

    {stage === "brief" ? <div className="chat-choices"><button type="button" onClick={requestReview}>{c.review}</button><button type="button" onClick={restart}>{c.restart}</button></div> : null}

    {stage === "contact" || stage === "sending" || stage === "error" ? <form className="chat-contact" onSubmit={submit}>
      <div><label>{c.name}<input value={contact.name} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))} required autoComplete="name" /></label><label>{c.email}<input value={contact.email} onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))} required type="email" autoComplete="email" /></label><label>{c.company}<input value={contact.company} onChange={(event) => setContact((current) => ({ ...current, company: event.target.value }))} required autoComplete="organization" /></label><label>{c.region}<input value={contact.region} onChange={(event) => setContact((current) => ({ ...current, region: event.target.value }))} required autoComplete="country-name" /></label></div>
      <label className="consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required /><span>{c.consent} <Link href={locale === "es" ? "/es/privacidad" : "/privacy"}>{c.privacy}</Link>.</span></label>
      <TurnstileWidget siteKey={publicConfig.turnstileSiteKey} locale={locale} onToken={handleTurnstileToken} />
      <label className="honeypot" aria-hidden="true">Fax number<input value={faxNumber} onChange={(event) => setFaxNumber(event.target.value)} tabIndex={-1} autoComplete="off" /></label>
      {stage === "error" ? <p className="form-error" role="alert">{c.error}</p> : null}
      <div className="chat-contact-actions"><button className="chat-back" type="button" onClick={() => setStage("brief")}>{c.back}</button><button type="submit" disabled={!canSubmitContact || stage === "sending"}>{stage === "sending" ? c.sending : c.submit}</button></div>
    </form> : null}

    {stage === "success" ? <div className="chat-choices"><button type="button" onClick={restart}>{c.restart}</button></div> : null}
  </div>;
}
