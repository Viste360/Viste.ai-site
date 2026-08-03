import Link from "next/link";
import type { PageDefinition } from "@/content/types";
import { industries, services, solutions } from "@/content/catalog";
import { FounderProfile } from "./founder-profile";
import { Breadcrumbs } from "./breadcrumbs";
import { PageJsonLd } from "./json-ld";
import { OperatorDetails } from "./operator-details";
import { SprintDetails } from "./sprint-details";
import { SystemMap } from "./system-map";

export function EditorialPage({ page }: { page: PageDefinition }) {
  const locale = page.locale; const isOverview = ["/services","/es/servicios","/solutions","/es/soluciones","/industries","/es/sectores"].includes(page.path);
  const items = page.path.includes("service") || page.path.includes("servicio") ? services : page.path.includes("solution") || page.path.includes("solucion") ? solutions : industries;
  return <main><PageJsonLd page={page} /><section className="page-hero"><div className="shell narrow"><Breadcrumbs path={page.path} title={page.title} locale={locale} /><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p className="lede">{page.lead}</p></div></section>
    {isOverview ? <section className="shell card-grid catalog-grid">{items.map((item, index) => <Link href={item.path[locale]} className="card" key={item.id}><span className="card-number">{String(index + 1).padStart(2,"0")}</span><h2>{item.title[locale]}</h2><p>{item.description[locale]}</p><span className="text-link">{locale === "en" ? "View approach →" : "Ver enfoque →"}</span></Link>)}</section> : null}
    <section className="shell editorial">{page.sections.map((section, index) => <article className="editorial-row" key={section.title}><span>{String(index + 1).padStart(2,"0")}</span><div><h2>{section.title}</h2>{section.paragraphs.map((p) => <p key={p}>{p}</p>)}{section.bullets ? <ul>{section.bullets.map((b) => <li key={b}>{b}</li>)}</ul> : null}</div></article>)}</section>
    {page.path.includes("ai-opportunity-sprint") || page.path.includes("sprint-oportunidades-ia") ? <SprintDetails locale={locale} /> : null}
    {page.path === "/about" || page.path === "/es/nosotros" ? <FounderProfile locale={locale} /> : null}
    {["/privacy","/terms","/cookies","/security","/es/privacidad","/es/terminos","/es/cookies","/es/seguridad"].includes(page.path) ? <OperatorDetails locale={locale} /> : null}
    {page.path.includes("solution") || page.path.includes("solucion") ? <SystemMap locale={locale} /> : null}
    {page.path === "/solutions/whatsapp-sales-service-control" || page.path === "/es/soluciones/control-ventas-servicio-whatsapp" ? <section className="shell demo-promo"><p className="eyebrow">{locale === "en" ? "Interactive demonstration" : "Demostración interactiva"}</p><h2>{locale === "en" ? "See assignment, response control and human approval working together" : "Ve cómo funcionan juntos la asignación, el control de respuesta y la aprobación humana"}</h2><Link className="button" href={`${page.path}/demo`}>{locale === "en" ? "Open illustrative demo" : "Abrir demo ilustrativa"}</Link></section> : null}
    <section className="shell callout"><div><p className="eyebrow">{locale === "en" ? "Make it operational" : "Hazlo operativo"}</p><h2>{page.cta.label}</h2><p>{page.cta.note}</p></div><Link href={page.cta.href} className="button">{page.cta.label}</Link></section>
  </main>;
}
