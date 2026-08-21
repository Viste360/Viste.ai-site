import { z } from "zod";

export const opportunityIntents = [
  "AI_EXPLORATION",
  "WHATSAPP_OPERATIONS",
  "SUPPORT_AUTOMATION",
  "KNOWLEDGE_ASSISTANT",
  "DOCUMENT_WORKFLOW",
  "SALES_CRM",
  "DATA_INTELLIGENCE",
  "CUSTOM_PRODUCT",
  "PARTNER",
  "EXISTING_CLIENT",
  "NOT_FIT",
] as const;

export const opportunityStages = [
  "NEW",
  "DIAGNOSING",
  "HUMAN_REVIEW",
  "QUALIFIED",
  "DISCOVERY_BOOKED",
  "SPRINT_PROPOSED",
  "SPRINT_WON",
  "PILOT_PROPOSED",
  "IMPLEMENTATION",
  "NURTURE",
  "CLOSED",
] as const;

export type OpportunityIntent = (typeof opportunityIntents)[number];
export type OpportunityStage = (typeof opportunityStages)[number];
export type Priority = "P1_PRIORITY" | "P2_QUALIFIED" | "P3_DEVELOP" | "P4_EARLY";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export const intentServiceMap: Record<OpportunityIntent, { en: { label: string; href: string }; es: { label: string; href: string } }> = {
  AI_EXPLORATION: {
    en: { label: "AI Opportunity Sprint", href: "/services/ai-opportunity-sprint" },
    es: { label: "Sprint de Oportunidades de IA", href: "/es/servicios/sprint-oportunidades-ia" },
  },
  WHATSAPP_OPERATIONS: {
    en: { label: "Customer Service and WhatsApp Operations", href: "/services/customer-service-whatsapp" },
    es: { label: "Atención al Cliente y Operaciones de WhatsApp", href: "/es/servicios/atencion-cliente-whatsapp" },
  },
  SUPPORT_AUTOMATION: {
    en: { label: "Customer Service and WhatsApp Operations", href: "/services/customer-service-whatsapp" },
    es: { label: "Atención al Cliente y Operaciones de WhatsApp", href: "/es/servicios/atencion-cliente-whatsapp" },
  },
  KNOWLEDGE_ASSISTANT: {
    en: { label: "Internal Knowledge Assistants", href: "/services/knowledge-assistants" },
    es: { label: "Asistentes Internos de Conocimiento", href: "/es/servicios/asistentes-conocimiento" },
  },
  DOCUMENT_WORKFLOW: {
    en: { label: "Workflow and Document Automation", href: "/services/workflow-automation" },
    es: { label: "Automatización de Flujos y Documentos", href: "/es/servicios/automatizacion-flujos" },
  },
  SALES_CRM: {
    en: { label: "Sales and CRM Automation", href: "/services/sales-crm-automation" },
    es: { label: "Automatización de Ventas y CRM", href: "/es/servicios/automatizacion-ventas-crm" },
  },
  DATA_INTELLIGENCE: {
    en: { label: "Data and Decision Intelligence", href: "/services/data-intelligence" },
    es: { label: "Datos e Inteligencia para Decisiones", href: "/es/servicios/inteligencia-datos" },
  },
  CUSTOM_PRODUCT: {
    en: { label: "Website and Business App Development", href: "/services/website-app-development" },
    es: { label: "Desarrollo Web y Aplicaciones de Negocio", href: "/es/servicios/desarrollo-web-aplicaciones" },
  },
  PARTNER: {
    en: { label: "AI delivery partnerships", href: "/industries/it-providers-resellers" },
    es: { label: "Colaboración para entrega de IA", href: "/es/sectores/proveedores-ti-distribuidores" },
  },
  EXISTING_CLIENT: {
    en: { label: "Human support", href: "/contact" },
    es: { label: "Atención humana", href: "/es/contacto" },
  },
  NOT_FIT: {
    en: { label: "Practical AI questions", href: "/questions" },
    es: { label: "Preguntas prácticas sobre IA", href: "/es/preguntas" },
  },
};

const levelSchema = z.enum(["none", "low", "medium", "high"]);

export const opportunitySubmissionSchema = z.object({
  locale: z.enum(["en", "es"]),
  initialNeed: z.string().trim().min(20).max(2_500),
  currentProcess: z.string().trim().min(20).max(2_500),
  affectedUsers: z.string().trim().min(2).max(500),
  volume: z.enum(["occasional", "weekly", "daily", "high"]),
  businessImpact: z.string().trim().min(15).max(2_000),
  desiredOutcome: z.string().trim().min(15).max(2_000),
  systems: z.string().trim().min(2).max(1_500),
  dataReadiness: levelSchema,
  processOwnership: levelSchema,
  stakeholderAccess: levelSchema,
  timeline: z.enum(["planning", "six_months", "quarter", "thirty_days"]),
  commercialReadiness: levelSchema,
  risk: z.enum(["LOW", "MEDIUM", "HIGH"]),
  constraints: z.string().trim().max(1_500).default(""),
  advisorTranscript: z.string().trim().max(8_000).optional(),
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().min(2).max(160),
  region: z.string().trim().min(2).max(120),
  consent: z.literal(true),
  consentWording: z.string().trim().min(20).max(1_000),
  sourceUrl: z.url().max(500),
  referrer: z.string().max(500).default(""),
  utmSource: z.string().max(120).default(""),
  utmMedium: z.string().max(120).default(""),
  utmCampaign: z.string().max(120).default(""),
  utmTerm: z.string().max(120).default(""),
  utmContent: z.string().max(120).default(""),
  gclid: z.string().max(200).default(""),
  faxNumber: z.string().max(200).default(""),
  turnstileToken: z.string().max(2_048).default(""),
  startedAt: z.number().int().positive(),
});

export type OpportunitySubmission = z.infer<typeof opportunitySubmissionSchema>;

const keywordGroups: Array<[OpportunityIntent, string[]]> = [
  ["EXISTING_CLIENT", ["existing client", "current client", "support with our project", "cliente actual", "ya soy cliente", "proyecto existente"]],
  ["PARTNER", ["partner", "partnership", "white label", "reseller", "canal", "socio", "colaboración", "marca blanca"]],
  ["WHATSAPP_OPERATIONS", ["whatsapp", "mensajería", "mensajeria"]],
  ["SALES_CRM", ["crm", "sales", "lead", "pipeline", "hubspot", "salesforce", "ventas", "oportunidad comercial"]],
  ["KNOWLEDGE_ASSISTANT", ["knowledge", "policy", "technical manual", "search internal", "answers with sources", "conocimiento", "procedimiento", "buscar información", "buscar informacion", "respuestas con fuentes"]],
  ["DOCUMENT_WORKFLOW", ["document", "documents", "pdf", "invoice", "contract", "documento", "documentos", "factura", "contrato", "expediente"]],
  ["DATA_INTELLIGENCE", ["dashboard", "report", "analytics", "data", "kpi", "reporting", "datos", "informe"]],
  ["SUPPORT_AUTOMATION", ["support", "ticket", "customer service", "helpdesk", "atención al cliente", "atencion al cliente", "soporte"]],
  ["CUSTOM_PRODUCT", ["website", "web site", "web app", "custom app", "software product", "platform", "portal", "admin dashboard", "database", "full stack", "sitio web", "página web", "pagina web", "aplicación", "aplicacion", "producto", "plataforma", "panel de administración", "base de datos"]],
];

export function classifyIntent(text: string): { intent: OpportunityIntent; confidence: number; evidence: string[] } {
  const normalized = text.toLocaleLowerCase();
  const containsKeyword = (keyword: string) => keyword.includes(" ")
    ? normalized.includes(keyword)
    : new RegExp(`(^|[^\\p{L}\\p{N}])${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}\\p{N}]|$)`, "u").test(normalized);
  const matches = keywordGroups
    .map(([intent, keywords]) => ({ intent, evidence: keywords.filter(containsKeyword) }))
    .filter(({ evidence }) => evidence.length)
    .sort((a, b) => b.evidence.length - a.evidence.length);
  if (!matches.length) return { intent: "AI_EXPLORATION", confidence: 0.42, evidence: [] };
  return { intent: matches[0].intent, confidence: Math.min(0.95, 0.62 + matches[0].evidence.length * 0.11), evidence: matches[0].evidence.slice(0, 3) };
}

const weights = {
  problem_clarity: 15,
  operational_frequency: 10,
  measurable_impact: 20,
  process_ownership: 10,
  systems_data_readiness: 10,
  timeline_urgency: 10,
  commercial_readiness: 10,
  viste_service_fit: 15,
} as const;

type ScoreKey = keyof typeof weights;
export type ScoreComponent = { key: ScoreKey; score: number; maximum: number; evidence: string; confidence: number };
export type OpportunityScore = { total: number; priority: Priority; confidence: number; components: ScoreComponent[] };

const levelFactor = { none: 0, low: 0.35, medium: 0.7, high: 1 } as const;
const frequencyFactor = { occasional: 0.25, weekly: 0.55, daily: 0.82, high: 1 } as const;
const timelineFactor = { planning: 0.3, six_months: 0.55, quarter: 0.8, thirty_days: 1 } as const;

function component(key: ScoreKey, factor: number, evidence: string, confidence = 0.85): ScoreComponent {
  return { key, score: Math.round(weights[key] * Math.max(0, Math.min(1, factor))), maximum: weights[key], evidence, confidence };
}

export function scoreOpportunity(input: Pick<OpportunitySubmission, "initialNeed" | "currentProcess" | "volume" | "businessImpact" | "desiredOutcome" | "processOwnership" | "stakeholderAccess" | "dataReadiness" | "timeline" | "commercialReadiness">, intent = classifyIntent(input.initialNeed)): OpportunityScore {
  const clarity = Math.min(1, (input.initialNeed.length + input.currentProcess.length) / 420);
  const impact = Math.min(1, (input.businessImpact.length + input.desiredOutcome.length) / 320);
  const ownership = (levelFactor[input.processOwnership] + levelFactor[input.stakeholderAccess]) / 2;
  const fit = intent.intent === "NOT_FIT" ? 0 : intent.intent === "AI_EXPLORATION" ? 0.55 : 0.9;
  const components = [
    component("problem_clarity", clarity, input.currentProcess),
    component("operational_frequency", frequencyFactor[input.volume], input.volume, 0.98),
    component("measurable_impact", impact, input.desiredOutcome),
    component("process_ownership", ownership, `${input.processOwnership}; stakeholder access: ${input.stakeholderAccess}`, 0.95),
    component("systems_data_readiness", levelFactor[input.dataReadiness], input.dataReadiness, 0.95),
    component("timeline_urgency", timelineFactor[input.timeline], input.timeline, 0.98),
    component("commercial_readiness", levelFactor[input.commercialReadiness], input.commercialReadiness, 0.95),
    component("viste_service_fit", fit, `${intent.intent}${intent.evidence.length ? `: ${intent.evidence.join(", ")}` : ""}`, intent.confidence),
  ];
  const total = components.reduce((sum, item) => sum + item.score, 0);
  const priority: Priority = total >= 80 ? "P1_PRIORITY" : total >= 65 ? "P2_QUALIFIED" : total >= 45 ? "P3_DEVELOP" : "P4_EARLY";
  const confidence = Number((components.reduce((sum, item) => sum + item.confidence, 0) / components.length).toFixed(2));
  return { total, priority, confidence, components };
}

export function initialStage(score: OpportunityScore, risk: RiskLevel, intent: OpportunityIntent): OpportunityStage {
  if (risk === "HIGH" || intent === "EXISTING_CLIENT") return "HUMAN_REVIEW";
  if (score.total >= 65) return "QUALIFIED";
  if (score.total >= 45) return "DIAGNOSING";
  return "NURTURE";
}

export function buildOpportunityBrief(input: OpportunitySubmission) {
  const classification = classifyIntent(`${input.initialNeed}\n${input.currentProcess}\n${input.systems}`);
  const score = scoreOpportunity(input, classification);
  const service = intentServiceMap[classification.intent][input.locale];
  return {
    classification,
    score,
    stage: initialStage(score, input.risk, classification.intent),
    service,
    missingInformation: [
      input.dataReadiness === "none" || input.dataReadiness === "low" ? (input.locale === "es" ? "Fuentes de datos confirmadas" : "Confirmed data sources") : null,
      input.processOwnership === "none" || input.processOwnership === "low" ? (input.locale === "es" ? "Responsable del proceso" : "Named process owner") : null,
    ].filter((item): item is string => Boolean(item)),
    nextAction: classification.intent === "EXISTING_CLIENT" || input.risk === "HIGH"
      ? (input.locale === "es" ? "Revisión humana prioritaria" : "Priority human review")
      : score.total >= 65
        ? (input.locale === "es" ? "Sesión de diagnóstico con un profesional senior" : "Diagnostic session with a senior practitioner")
        : (input.locale === "es" ? "Completar evidencia antes de definir el alcance" : "Complete the evidence before scoping"),
  };
}
