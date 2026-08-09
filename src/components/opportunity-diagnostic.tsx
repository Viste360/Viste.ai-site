"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  evaluateDiagnostic,
  type Bottleneck,
  type DataReadiness,
  type DiagnosticAnswers,
  type DiagnosticRecommendation,
  type Outcome,
  type Sensitivity,
  type System,
  type Volume,
  type Workflow,
} from "@/lib/opportunity-diagnostic";
import { BookingCta } from "./booking-cta";

type Locale = "en" | "es";
type PartialAnswers = Partial<Omit<DiagnosticAnswers, "systems">> & { systems: System[] };

const copy = {
  en: {
    steps: [
      { title: "What kind of work is this?", hint: "Choose the closest operating context.", options: [["customer", "Customer service"], ["sales", "Sales and follow-up"], ["operations", "Internal operations"], ["knowledge", "Finding and applying knowledge"], ["documents", "Document-heavy work"], ["reporting", "Reporting and decisions"], ["other", "Another workflow"]] },
      { title: "Where does the work get stuck?", hint: "Choose the bottleneck that causes the most friction.", options: [["unanswered", "Requests wait or go unanswered"], ["repetitive", "People repeat manual steps"], ["finding", "Information is hard to find"], ["follow_up", "Follow-up is inconsistent"], ["document_handling", "Documents need reading or routing"], ["fragmented_data", "Data is fragmented"], ["undefined", "The process is not yet clear"]] },
      { title: "How often does it happen?", hint: "A rough frequency is enough for this first view.", options: [["occasional", "A few times a month"], ["weekly", "Every week"], ["daily", "Every day"], ["high", "High monthly volume"]] },
      { title: "Which systems or channels are involved?", hint: "Select every option that materially shapes the workflow.", options: [["whatsapp", "WhatsApp"], ["crm", "CRM"], ["email", "Email"], ["erp", "ERP or core system"], ["documents", "Documents or knowledge base"], ["spreadsheets", "Spreadsheets and reporting"], ["other", "Other systems"]] },
      { title: "What usable information is available?", hint: "Think about approved sources, not every file the company owns.", options: [["structured", "Structured system records"], ["documents", "Approved documents"], ["conversations", "Conversation or ticket history"], ["mixed", "A mix of records and documents"], ["limited", "Very little usable information"]] },
      { title: "How much judgment or approval is involved?", hint: "This changes the controls a safe pilot needs.", options: [["low", "Low sensitivity and reversible"], ["review", "A person can review before action"], ["high", "Explicit approval is required"], ["regulated", "Regulated or highly sensitive"]] },
      { title: "Which outcome matters most?", hint: "Choose the first result you would want to baseline.", options: [["response", "Faster response"], ["time", "Less manual time"], ["accuracy", "Fewer errors and rework"], ["revenue", "More consistent commercial follow-through"], ["visibility", "Better operational visibility"], ["other", "Another measurable outcome"]] },
    ],
    step: "Step",
    of: "of",
    back: "Back",
    next: "Continue",
    finish: "See my preliminary result",
    select: "Select an answer to continue.",
    restart: "Start again",
    resultEyebrow: "Rule-based preliminary recommendation",
    why: "Why this result",
    assumptions: "Assumptions used",
    dependencies: "Risks and dependencies",
    metric: "First metric to baseline",
    explain: "This is transparent decision support, not a scientific score, prediction, quotation or guarantee.",
    email: "Email or save this summary",
    discuss: "Discuss this workflow",
  },
  es: {
    steps: [
      { title: "¿Qué tipo de trabajo es?", hint: "Elige el contexto operativo más cercano.", options: [["customer", "Atención al cliente"], ["sales", "Ventas y seguimiento"], ["operations", "Operaciones internas"], ["knowledge", "Buscar y aplicar conocimiento"], ["documents", "Trabajo con muchos documentos"], ["reporting", "Reporting y decisiones"], ["other", "Otro flujo"]] },
      { title: "¿Dónde se atasca el trabajo?", hint: "Elige el cuello de botella que genera más fricción.", options: [["unanswered", "Las solicitudes esperan o quedan sin respuesta"], ["repetitive", "Las personas repiten pasos manuales"], ["finding", "Cuesta encontrar la información"], ["follow_up", "El seguimiento es irregular"], ["document_handling", "Hay que leer o enrutar documentos"], ["fragmented_data", "Los datos están fragmentados"], ["undefined", "El proceso aún no está claro"]] },
      { title: "¿Con qué frecuencia ocurre?", hint: "Una frecuencia aproximada basta para esta primera orientación.", options: [["occasional", "Unas veces al mes"], ["weekly", "Cada semana"], ["daily", "Cada día"], ["high", "Volumen mensual alto"]] },
      { title: "¿Qué sistemas o canales intervienen?", hint: "Selecciona todos los que condicionan el flujo.", options: [["whatsapp", "WhatsApp"], ["crm", "CRM"], ["email", "Email"], ["erp", "ERP o sistema principal"], ["documents", "Documentos o base de conocimiento"], ["spreadsheets", "Hojas de cálculo y reporting"], ["other", "Otros sistemas"]] },
      { title: "¿Qué información utilizable existe?", hint: "Piensa en fuentes aprobadas, no en todos los archivos de la empresa.", options: [["structured", "Registros estructurados"], ["documents", "Documentos aprobados"], ["conversations", "Historial de conversaciones o tickets"], ["mixed", "Mezcla de registros y documentos"], ["limited", "Muy poca información utilizable"]] },
      { title: "¿Cuánto juicio o aprobación requiere?", hint: "Esto cambia los controles que necesita un piloto seguro.", options: [["low", "Baja sensibilidad y reversible"], ["review", "Una persona puede revisar antes de actuar"], ["high", "Requiere aprobación explícita"], ["regulated", "Regulado o muy sensible"]] },
      { title: "¿Qué resultado importa más?", hint: "Elige el primer resultado que convendría medir.", options: [["response", "Responder más rápido"], ["time", "Reducir tiempo manual"], ["accuracy", "Reducir errores y reprocesos"], ["revenue", "Mejorar el seguimiento comercial"], ["visibility", "Mejorar la visibilidad operativa"], ["other", "Otro resultado medible"]] },
    ],
    step: "Paso",
    of: "de",
    back: "Atrás",
    next: "Continuar",
    finish: "Ver mi resultado preliminar",
    select: "Selecciona una respuesta para continuar.",
    restart: "Empezar de nuevo",
    resultEyebrow: "Recomendación preliminar basada en reglas",
    why: "Por qué aparece este resultado",
    assumptions: "Supuestos utilizados",
    dependencies: "Riesgos y dependencias",
    metric: "Primera métrica que conviene medir",
    explain: "Es una orientación transparente, no una puntuación científica, predicción, presupuesto ni garantía.",
    email: "Enviar o guardar este resumen por email",
    discuss: "Hablar sobre este flujo",
  },
} as const;

function selectedValue(step: number, answers: PartialAnswers) {
  if (step === 0) return answers.workflow;
  if (step === 1) return answers.bottleneck;
  if (step === 2) return answers.volume;
  if (step === 4) return answers.data;
  if (step === 5) return answers.sensitivity;
  if (step === 6) return answers.outcome;
  return undefined;
}

function complete(step: number, answers: PartialAnswers) {
  return step === 3 ? answers.systems.length > 0 : Boolean(selectedValue(step, answers));
}

export function OpportunityDiagnostic({ locale, bookingUrl }: { locale: Locale; bookingUrl?: string }) {
  const c = copy[locale];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({ systems: [] });
  const [result, setResult] = useState<DiagnosticRecommendation | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => trackEvent("diagnostic_viewed", { locale }), [locale]);

  const summaryHref = useMemo(() => {
    if (!result) return "mailto:";
    const body = [result.title, "", result.reason, "", `${c.metric}: ${result.firstMetric}`, "", `${c.dependencies}:`, ...result.dependencies.map((item) => `- ${item}`), "", c.explain].join("\n");
    return `mailto:?subject=${encodeURIComponent(locale === "es" ? "Mi orientación inicial de Viste.ai" : "My preliminary Viste.ai recommendation")}&body=${encodeURIComponent(body)}`;
  }, [c, locale, result]);

  function setSingle(value: string) {
    setMessage("");
    if (step === 0) setAnswers((current) => ({ ...current, workflow: value as Workflow }));
    if (step === 1) setAnswers((current) => ({ ...current, bottleneck: value as Bottleneck }));
    if (step === 2) setAnswers((current) => ({ ...current, volume: value as Volume }));
    if (step === 4) setAnswers((current) => ({ ...current, data: value as DataReadiness }));
    if (step === 5) setAnswers((current) => ({ ...current, sensitivity: value as Sensitivity }));
    if (step === 6) setAnswers((current) => ({ ...current, outcome: value as Outcome }));
    if (Object.keys(answers).length === 1) trackEvent("diagnostic_started", { locale });
  }

  function toggleSystem(value: System) {
    setMessage("");
    setAnswers((current) => ({ ...current, systems: current.systems.includes(value) ? current.systems.filter((item) => item !== value) : [...current.systems, value] }));
  }

  function advance() {
    if (!complete(step, answers)) { setMessage(c.select); return; }
    trackEvent("diagnostic_step_completed", { locale, step: step + 1 });
    if (step < 6) setStep((current) => current + 1);
  }

  function finish(event: React.FormEvent) {
    event.preventDefault();
    if (!complete(step, answers)) { setMessage(c.select); return; }
    const recommendation = evaluateDiagnostic(answers as DiagnosticAnswers, locale);
    setResult(recommendation);
    trackEvent("diagnostic_step_completed", { locale, step: 7 });
    trackEvent("diagnostic_completed", { locale, result: recommendation.kind });
    trackEvent("recommendation_viewed", { locale, result: recommendation.kind });
  }

  function restart() {
    setAnswers({ systems: [] });
    setResult(null);
    setStep(0);
    setMessage("");
  }

  if (result) {
    const discussHref = locale === "es" ? "/es/contacto?utm_source=diagnostic&utm_medium=owned&utm_campaign=opportunity_diagnostic#contact-form" : "/contact?utm_source=diagnostic&utm_medium=owned&utm_campaign=opportunity_diagnostic#contact-form";
    return <div className="diagnostic-result" aria-live="polite">
      <p className="eyebrow">{c.resultEyebrow}</p>
      <h3>{result.title}</h3>
      <p className="result-disclaimer">{c.explain}</p>
      <div className="result-grid">
        <article><h4>{c.why}</h4><p>{result.reason}</p></article>
        <article><h4>{c.metric}</h4><strong>{result.firstMetric}</strong></article>
        <article><h4>{c.assumptions}</h4><ul>{result.assumptions.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h4>{c.dependencies}</h4><ul>{result.dependencies.map((item) => <li key={item}>{item}</li>)}</ul></article>
      </div>
      <div className="result-links">
        <Link href={result.service.href} onClick={() => trackEvent("service_viewed_from_content", { locale, source: "diagnostic", destination: result.kind })}>{result.service.label} ↗</Link>
        {result.blueprint ? <Link href={result.blueprint.href} onClick={() => trackEvent("service_viewed_from_content", { locale, source: "diagnostic_blueprint", destination: result.kind })}>{result.blueprint.label} ↗</Link> : null}
      </div>
      <div className="button-row">
        <a className="button button-ghost" href={summaryHref} onClick={() => trackEvent("email_summary_requested", { locale, result: result.kind })}>{c.email}</a>
        <Link className="button" href={discussHref} onClick={() => trackEvent("content_cta_clicked", { locale, source: "diagnostic", destination: "contact_form" })}>{c.discuss}</Link>
      </div>
      <BookingCta locale={locale} bookingUrl={bookingUrl} source="diagnostic_result" fallbackHref={discussHref} compact />
      <button className="text-button" type="button" onClick={restart}>{c.restart}</button>
    </div>;
  }

  const current = c.steps[step];
  return <form className="diagnostic" onSubmit={finish}>
    <div className="diagnostic-progress"><span>{c.step} {step + 1} {c.of} 7</span><progress value={step + 1} max={7}>{step + 1}/7</progress></div>
    <fieldset>
      <legend>{current.title}</legend>
      <p>{current.hint}</p>
      <div className="diagnostic-options">
        {current.options.map(([value, label]) => {
          const isSystems = step === 3;
          const checked = isSystems ? answers.systems.includes(value as System) : selectedValue(step, answers) === value;
          return <label key={value} className={checked ? "selected" : ""}>
            <input type={isSystems ? "checkbox" : "radio"} name={`diagnostic-step-${step}`} value={value} checked={checked} onChange={() => isSystems ? toggleSystem(value as System) : setSingle(value)} />
            <span>{label}</span><i aria-hidden="true">{checked ? "✓" : "→"}</i>
          </label>;
        })}
      </div>
    </fieldset>
    {message ? <p className="diagnostic-message" role="alert">{message}</p> : null}
    <div className="diagnostic-actions">
      <button className="button button-ghost" type="button" disabled={step === 0} onClick={() => { setMessage(""); setStep((currentStep) => Math.max(0, currentStep - 1)); }}>{c.back}</button>
      {step < 6 ? <button className="button" type="button" onClick={advance}>{c.next}</button> : <button className="button" type="submit">{c.finish}</button>}
    </div>
  </form>;
}
