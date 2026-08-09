import type { Locale } from "./types";

export type GrowthPageKey = "opportunity" | "roi" | "questions";

export type GrowthPage = {
  key: GrowthPageKey;
  locale: Locale;
  path: string;
  alternatePath: string;
  title: string;
  description: string;
  publishApproved: boolean;
  lastReviewed: string;
};

const lastReviewed = "2026-08-09";

export const growthPages: GrowthPage[] = [
  {
    key: "opportunity",
    locale: "en",
    path: "/ai-for-my-business",
    alternatePath: "/es/ia-para-mi-negocio",
    title: "Do I need AI for my business? A practical diagnostic",
    description: "Identify the process worth improving, the evidence you need and a controlled, measurable first AI or automation step.",
    publishApproved: true,
    lastReviewed,
  },
  {
    key: "opportunity",
    locale: "es",
    path: "/es/ia-para-mi-negocio",
    alternatePath: "/ai-for-my-business",
    title: "¿Necesito IA para mi negocio? Diagnóstico práctico",
    description: "Descubre qué proceso conviene mejorar, qué datos necesitas y cómo definir un primer piloto de IA útil, controlado y medible.",
    publishApproved: true,
    lastReviewed,
  },
  {
    key: "roi",
    locale: "en",
    path: "/tools/ai-automation-roi-calculator",
    alternatePath: "/es/herramientas/calculadora-roi-automatizacion-ia",
    title: "AI automation ROI planning calculator",
    description: "Model effort, released capacity, operating cost and break-even using your own assumptions and a visible formula.",
    publishApproved: true,
    lastReviewed,
  },
  {
    key: "roi",
    locale: "es",
    path: "/es/herramientas/calculadora-roi-automatizacion-ia",
    alternatePath: "/tools/ai-automation-roi-calculator",
    title: "Calculadora de ROI de automatización con IA",
    description: "Modela esfuerzo, capacidad liberada, coste operativo y punto de equilibrio con tus propios supuestos y una fórmula visible.",
    publishApproved: true,
    lastReviewed,
  },
  {
    key: "questions",
    locale: "en",
    path: "/questions",
    alternatePath: "/es/preguntas",
    title: "Practical questions before implementing AI",
    description: "A decision hub for choosing a use case, estimating value, handling data and controlling AI in real business workflows.",
    publishApproved: true,
    lastReviewed,
  },
  {
    key: "questions",
    locale: "es",
    path: "/es/preguntas",
    alternatePath: "/questions",
    title: "Preguntas prácticas antes de implementar IA",
    description: "Un centro de decisión para elegir casos de uso, estimar valor, tratar datos y controlar la IA en procesos reales.",
    publishApproved: true,
    lastReviewed,
  },
];

export function getGrowthPage(path: string) {
  return growthPages.find((page) => page.path === path);
}

export function growthPath(key: GrowthPageKey, locale: Locale) {
  const found = growthPages.find((page) => page.key === key && page.locale === locale);
  if (!found) throw new Error(`Missing growth route for ${key}:${locale}`);
  return found.path;
}

export const growthPairs = growthPages
  .filter((page) => page.locale === "en")
  .map((page) => [page.path, page.alternatePath] as [string, string]);
