import type { Locale } from "@/content/types";

export type Workflow = "customer" | "sales" | "operations" | "knowledge" | "documents" | "reporting" | "other";
export type Bottleneck = "unanswered" | "repetitive" | "finding" | "follow_up" | "document_handling" | "fragmented_data" | "undefined";
export type Volume = "occasional" | "weekly" | "daily" | "high";
export type System = "whatsapp" | "crm" | "email" | "erp" | "documents" | "spreadsheets" | "other";
export type DataReadiness = "structured" | "documents" | "conversations" | "mixed" | "limited";
export type Sensitivity = "low" | "review" | "high" | "regulated";
export type Outcome = "response" | "time" | "accuracy" | "revenue" | "visibility" | "other";

export type DiagnosticAnswers = {
  workflow: Workflow;
  bottleneck: Bottleneck;
  volume: Volume;
  systems: System[];
  data: DataReadiness;
  sensitivity: Sensitivity;
  outcome: Outcome;
};

export type RecommendationKind = "automation" | "knowledge" | "customer" | "documents" | "sales" | "data" | "not_ready";

export type DiagnosticRecommendation = {
  kind: RecommendationKind;
  title: string;
  reason: string;
  assumptions: string[];
  dependencies: string[];
  firstMetric: string;
  service: { label: string; href: string };
  blueprint?: { label: string; href: string };
};

type ScoredKind = Exclude<RecommendationKind, "not_ready">;
type Scores = Record<ScoredKind, number>;

const priorities: ScoredKind[] = ["customer", "documents", "knowledge", "sales", "data", "automation"];

function add(scores: Scores, kind: ScoredKind, points: number) {
  scores[kind] += points;
}

function paths(kind: RecommendationKind, locale: Locale) {
  const es = locale === "es";
  const map: Record<RecommendationKind, { service: string; blueprint?: string }> = {
    automation: { service: es ? "/es/servicios/automatizacion-flujos" : "/services/workflow-automation" },
    knowledge: { service: es ? "/es/servicios/asistentes-conocimiento" : "/services/knowledge-assistants", blueprint: es ? "/es/soluciones/asistente-conocimiento-empresa" : "/solutions/company-knowledge-assistant" },
    customer: { service: es ? "/es/servicios/atencion-cliente-whatsapp" : "/services/customer-service-whatsapp", blueprint: es ? "/es/soluciones/control-ventas-servicio-whatsapp" : "/solutions/whatsapp-sales-service-control" },
    documents: { service: es ? "/es/servicios/automatizacion-flujos" : "/services/workflow-automation", blueprint: es ? "/es/soluciones/operaciones-documentales" : "/solutions/document-operations" },
    sales: { service: es ? "/es/servicios/automatizacion-ventas-crm" : "/services/sales-crm-automation" },
    data: { service: es ? "/es/servicios/inteligencia-datos" : "/services/data-intelligence", blueprint: es ? "/es/soluciones/inteligencia-operaciones" : "/solutions/operations-intelligence" },
    not_ready: { service: es ? "/es/servicios/sprint-oportunidades-ia" : "/services/ai-opportunity-sprint" },
  };
  return map[kind];
}

const labels = {
  en: {
    title: {
      automation: "Automation-first candidate",
      knowledge: "Knowledge-assistant candidate",
      customer: "Customer and WhatsApp operations candidate",
      documents: "Document-operations candidate",
      sales: "Sales and CRM candidate",
      data: "Data and decision-intelligence candidate",
      not_ready: "Define the process first",
    },
    reason: {
      automation: "The strongest signals are repeatable work, usable inputs and an outcome based on time or accuracy. Start with rules, handoffs and exceptions before adding generative AI.",
      knowledge: "The bottleneck is finding and applying information. A permission-aware assistant grounded in approved sources may be more useful than broad automation.",
      customer: "The pattern points to incoming conversations, response ownership and channel visibility. The operating workflow matters before any automated reply.",
      documents: "The work centres on receiving, reading, validating or routing documents. A controlled document flow is the clearest first hypothesis.",
      sales: "The main loss appears in qualification, follow-through or CRM consistency. Assistance should support commercial ownership, not replace it.",
      data: "The need is a reliable operational view across fragmented data. Agree definitions and ownership before adding natural-language analysis.",
      not_ready: "The process, volume or usable information is not clear enough for a responsible AI pilot. Define the workflow and baseline before selecting technology.",
    },
  },
  es: {
    title: {
      automation: "Candidato para automatización primero",
      knowledge: "Candidato para asistente de conocimiento",
      customer: "Candidato para operaciones de cliente y WhatsApp",
      documents: "Candidato para operaciones documentales",
      sales: "Candidato para ventas y CRM",
      data: "Candidato para datos e inteligencia de decisión",
      not_ready: "Definir primero el proceso",
    },
    reason: {
      automation: "Las señales más claras son trabajo repetible, entradas utilizables y un objetivo de tiempo o precisión. Conviene empezar por reglas, traspasos y excepciones antes de añadir IA generativa.",
      knowledge: "El cuello de botella está en encontrar y aplicar información. Un asistente con permisos y fuentes aprobadas puede aportar más que una automatización amplia.",
      customer: "El patrón apunta a conversaciones entrantes, responsables de respuesta y visibilidad del canal. El flujo operativo debe definirse antes de automatizar respuestas.",
      documents: "El trabajo se concentra en recibir, leer, validar o enrutar documentos. Un flujo documental controlado es la primera hipótesis más clara.",
      sales: "La principal pérdida parece estar en la cualificación, el seguimiento o la consistencia del CRM. La asistencia debe reforzar la responsabilidad comercial, no sustituirla.",
      data: "La necesidad es una visión operativa fiable sobre datos fragmentados. Primero deben acordarse definiciones y responsables.",
      not_ready: "El proceso, el volumen o la información utilizable todavía no están suficientemente claros para un piloto responsable. Define el flujo y la línea base antes de elegir tecnología.",
    },
  },
} as const;

const assumptionCopy = {
  en: {
    volume: { occasional: "The workflow happens only occasionally.", weekly: "The workflow repeats every week.", daily: "The workflow repeats every day.", high: "The workflow runs at high monthly volume." },
    data: { structured: "Structured records are available.", documents: "Approved documents are the main source.", conversations: "Conversation history is available and may require minimisation.", mixed: "Useful information exists across several formats.", limited: "Usable source information is currently limited." },
    sensitivity: { low: "Actions are low sensitivity.", review: "A person can review outputs before action.", high: "The workflow needs explicit approval controls.", regulated: "The workflow requires legal, privacy and security review." },
  },
  es: {
    volume: { occasional: "El flujo ocurre solo de forma ocasional.", weekly: "El flujo se repite cada semana.", daily: "El flujo se repite a diario.", high: "El flujo tiene un volumen mensual alto." },
    data: { structured: "Hay registros estructurados disponibles.", documents: "Los documentos aprobados son la fuente principal.", conversations: "Hay historial de conversaciones y puede requerir minimización.", mixed: "La información útil existe en varios formatos.", limited: "La información fuente utilizable todavía es limitada." },
    sensitivity: { low: "Las acciones son de baja sensibilidad.", review: "Una persona puede revisar el resultado antes de actuar.", high: "El flujo necesita controles explícitos de aprobación.", regulated: "El flujo requiere revisión legal, de privacidad y seguridad." },
  },
} as const;

const metricCopy = {
  en: { response: "Median first-response time", time: "Minutes of manual effort per completed case", accuracy: "Exception and rework rate", revenue: "Qualified follow-up completed on time", visibility: "Time to identify and assign an exception", other: "One agreed operational outcome with a current baseline" },
  es: { response: "Mediana de primera respuesta", time: "Minutos de esfuerzo manual por caso completado", accuracy: "Tasa de excepciones y reprocesos", revenue: "Seguimientos cualificados completados a tiempo", visibility: "Tiempo para identificar y asignar una excepción", other: "Un resultado operativo acordado con su línea base actual" },
} as const;

function dependencies(kind: RecommendationKind, sensitivity: Sensitivity, locale: Locale) {
  const es = locale === "es";
  const base = es
    ? ["Un responsable del proceso y un criterio de éxito", "Acceso confirmado a las fuentes y sistemas necesarios"]
    : ["A named process owner and a success measure", "Confirmed access to the required sources and systems"];
  if (sensitivity === "high" || sensitivity === "regulated") base.push(es ? "Revisión de privacidad, seguridad y aprobaciones antes del piloto" : "Privacy, security and approval review before a pilot");
  else if (kind === "not_ready") base.push(es ? "Un mapa del proceso actual, incluidos volumen y excepciones" : "A current-process map including volume and exceptions");
  else base.push(es ? "Una ruta de excepción y traspaso a una persona" : "An exception path and human handover");
  return base.slice(0, 3);
}

export function evaluateDiagnostic(answers: DiagnosticAnswers, locale: Locale): DiagnosticRecommendation {
  const scores: Scores = { automation: 0, knowledge: 0, customer: 0, documents: 0, sales: 0, data: 0 };

  const workflowWeights: Record<Workflow, Partial<Scores>> = {
    customer: { customer: 4 }, sales: { sales: 4 }, operations: { automation: 3, documents: 1 }, knowledge: { knowledge: 4 }, documents: { documents: 4, automation: 1 }, reporting: { data: 4 }, other: { automation: 1 },
  };
  const bottleneckWeights: Record<Bottleneck, Partial<Scores>> = {
    unanswered: { customer: 4 }, repetitive: { automation: 4, documents: 1 }, finding: { knowledge: 4 }, follow_up: { sales: 4, customer: 1 }, document_handling: { documents: 5 }, fragmented_data: { data: 5 }, undefined: {},
  };
  for (const [kind, points] of Object.entries(workflowWeights[answers.workflow])) add(scores, kind as ScoredKind, points || 0);
  for (const [kind, points] of Object.entries(bottleneckWeights[answers.bottleneck])) add(scores, kind as ScoredKind, points || 0);

  for (const system of answers.systems) {
    if (system === "whatsapp") add(scores, "customer", 3);
    if (system === "crm") add(scores, "sales", 2);
    if (system === "documents") { add(scores, "documents", 2); add(scores, "knowledge", 1); }
    if (system === "spreadsheets" || system === "erp") add(scores, "data", 1);
    if (system === "email") add(scores, "automation", 1);
  }
  if (answers.data === "documents") { add(scores, "documents", 2); add(scores, "knowledge", 2); }
  if (answers.data === "conversations") { add(scores, "customer", 2); add(scores, "sales", 1); }
  if (answers.data === "structured") { add(scores, "automation", 2); add(scores, "data", 1); }
  if (answers.outcome === "response") add(scores, "customer", 2);
  if (answers.outcome === "time") add(scores, "automation", 2);
  if (answers.outcome === "accuracy") { add(scores, "documents", 1); add(scores, "automation", 1); }
  if (answers.outcome === "revenue") add(scores, "sales", 3);
  if (answers.outcome === "visibility") add(scores, "data", 3);

  const lowReadiness = answers.bottleneck === "undefined"
    || (answers.volume === "occasional" && answers.data === "limited")
    || (answers.data === "limited" && Math.max(...Object.values(scores)) < 7);
  const kind: RecommendationKind = lowReadiness
    ? "not_ready"
    : priorities.reduce((best, candidate) => scores[candidate] > scores[best] ? candidate : best, priorities[0]);
  const route = paths(kind, locale);
  const copy = labels[locale];
  const assumptions = assumptionCopy[locale];

  return {
    kind,
    title: copy.title[kind],
    reason: copy.reason[kind],
    assumptions: [assumptions.volume[answers.volume], assumptions.data[answers.data], assumptions.sensitivity[answers.sensitivity]],
    dependencies: dependencies(kind, answers.sensitivity, locale),
    firstMetric: metricCopy[locale][answers.outcome],
    service: { label: locale === "es" ? "Ver servicio relacionado" : "View the related service", href: route.service },
    blueprint: route.blueprint ? { label: locale === "es" ? "Ver diseño de solución" : "View the Solution Blueprint", href: route.blueprint } : undefined,
  };
}
