import type { Insight, Locale } from "./types";

export type InsightSource = { title: Record<Locale, string>; publisher: string; url: string };

const nist = { title: { en: "AI Risk Management Framework", es: "Marco de Gestión de Riesgos de IA" }, publisher: "NIST", url: "https://www.nist.gov/itl/ai-risk-management-framework" };
const nistGenAi = { title: { en: "Artificial Intelligence Risk Management Framework: Generative AI Profile", es: "Perfil de IA generativa del Marco de Gestión de Riesgos de IA" }, publisher: "NIST", url: "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence" };
const euAiAct = { title: { en: "Regulation (EU) 2024/1689 — Artificial Intelligence Act", es: "Reglamento (UE) 2024/1689 — Ley de Inteligencia Artificial" }, publisher: "EUR-Lex", url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj" };
const oecd = { title: { en: "OECD AI Principles", es: "Principios de IA de la OCDE" }, publisher: "OECD.AI", url: "https://oecd.ai/en/ai-principles" };

export const insightSources: Record<string, InsightSource[]> = {
  "first-use-case": [nist, oecd],
  "whatsapp-monitoring": [euAiAct, nist],
  "knowledge-permissions": [nistGenAi, nist],
  "pilot-production": [nist, nistGenAi],
  "white-label": [nist, oecd],
  "hospitality-automation": [euAiAct, nist],
  "measure-value": [oecd, nist],
  "human-oversight": [euAiAct, nist],
};

export const relatedInsightIds: Record<string, string[]> = {
  "first-use-case": ["pilot-production", "measure-value"],
  "whatsapp-monitoring": ["human-oversight", "hospitality-automation"],
  "knowledge-permissions": ["human-oversight", "pilot-production"],
  "pilot-production": ["first-use-case", "measure-value"],
  "white-label": ["first-use-case", "pilot-production"],
  "hospitality-automation": ["human-oversight", "measure-value"],
  "measure-value": ["first-use-case", "pilot-production"],
  "human-oversight": ["knowledge-permissions", "hospitality-automation"],
};

export const insightServicePath: Record<string, Record<Locale, string>> = {
  "first-use-case": { en: "/services/ai-opportunity-sprint", es: "/es/servicios/sprint-oportunidades-ia" },
  "whatsapp-monitoring": { en: "/solutions/whatsapp-sales-service-control", es: "/es/soluciones/control-ventas-servicio-whatsapp" },
  "knowledge-permissions": { en: "/services/knowledge-assistants", es: "/es/servicios/asistentes-conocimiento" },
  "pilot-production": { en: "/process", es: "/es/proceso" },
  "white-label": { en: "/partners", es: "/es/socios" },
  "hospitality-automation": { en: "/industries/hospitality-property", es: "/es/sectores/hospitalidad-propiedades" },
  "measure-value": { en: "/services/data-intelligence", es: "/es/servicios/inteligencia-datos" },
  "human-oversight": { en: "/services/customer-service-whatsapp", es: "/es/servicios/atencion-cliente-whatsapp" },
};

export function insightMinutes(insight: Insight, locale: Locale) {
  const sectionWords = insight.sections[locale].flatMap((section) => [section.title, ...section.paragraphs, ...(section.bullets || [])]).join(" ");
  const words = [insight.title[locale], insight.description[locale], sectionWords].join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / (locale === "en" ? 200 : 180)));
}

export function readTimeLabel(insight: Insight, locale: Locale) {
  const minutes = insightMinutes(insight, locale);
  return locale === "en" ? `${minutes} min read` : `${minutes} min de lectura`;
}
