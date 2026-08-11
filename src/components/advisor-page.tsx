import { OpportunityAdvisor } from "./opportunity-advisor";

export function AdvisorPage({ locale }: { locale: "en" | "es" }) {
  const es = locale === "es";
  return <main className="advisor-page"><section className="page-hero advisor-hero"><div className="shell narrow"><p className="eyebrow">VIS_010 · Viste Opportunity Engine</p><h1>{es ? "Encuentra el punto de partida adecuado para IA." : "Find the right AI starting point."}</h1><p className="lede">{es ? "Convierte un problema operativo poco definido en una oportunidad estructurada, con evidencia, nivel de riesgo y un siguiente paso responsable." : "Turn an unstructured operational problem into a structured opportunity with evidence, risk level and a responsible next step."}</p></div></section><section className="shell advisor-section"><OpportunityAdvisor locale={locale} /></section></main>;
}
