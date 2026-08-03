import { publicConfig } from "@/lib/public-config";

export function SprintDetails({ locale }: { locale: "en" | "es" }) {
  const es = locale === "es";
  const sprint = publicConfig.sprint;
  const items = [
    { label: es ? "Duración" : "Duration", value: sprint.duration || (es ? "Se acuerda según la complejidad del flujo y el acceso a responsables." : "Agreed around workflow complexity and access to process owners.") },
    { label: es ? "Participantes" : "Participants", value: sprint.participants || (es ? "Patrocinador, responsable del proceso, usuarios clave y responsables técnicos o de datos." : "Sponsor, process owner, representative users and relevant technical or data owners.") },
    { label: es ? "Entregables" : "Deliverables", value: sprint.deliverables || (es ? "Mapa de oportunidades, priorización, arquitectura, controles, métricas, alcance del piloto y hoja de ruta." : "Opportunity map, prioritisation, architecture, controls, measures, pilot scope and roadmap.") },
    { label: es ? "Inversión inicial" : "Starting investment", value: sprint.startingInvestment || (es ? "Se confirma por escrito tras revisar el alcance; no se publica una cifra no aprobada." : "Confirmed in writing after scope review; no unapproved figure is published.") },
  ];
  return <section className="shell sprint-details" aria-labelledby="sprint-details-title"><p className="eyebrow">{es ? "Alcance comercial" : "Commercial shape"}</p><h2 id="sprint-details-title">{es ? "Qué hace que el Sprint esté listo para decidir" : "What makes the Sprint decision-ready"}</h2><div>{items.map((item) => <article key={item.label}><span>{item.label}</span><p>{item.value}</p></article>)}</div></section>;
}
