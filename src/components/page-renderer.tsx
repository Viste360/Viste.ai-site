import Link from "next/link";
import type { PageDefinition } from "@/content/types";
import { industries, services, solutions } from "@/content/catalog";
import { SystemMap } from "./system-map";

export function EditorialPage({ page }: { page: PageDefinition }) {
  const locale = page.locale; const isOverview = ["/services","/es/servicios","/solutions","/es/soluciones","/industries","/es/sectores"].includes(page.path);
  const items = page.path.includes("service") || page.path.includes("servicio") ? services : page.path.includes("solution") || page.path.includes("solucion") ? solutions : industries;
  return <main><section className="page-hero"><div className="shell narrow"><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p className="lede">{page.lead}</p></div></section>
    {isOverview ? <section className="shell card-grid catalog-grid">{items.map((item, index) => <Link href={item.path[locale]} className="card" key={item.id}><span className="card-number">{String(index + 1).padStart(2,"0")}</span><h2>{item.title[locale]}</h2><p>{item.description[locale]}</p><span className="text-link">{locale === "en" ? "View approach →" : "Ver enfoque →"}</span></Link>)}</section> : null}
    <section className="shell editorial">{page.sections.map((section, index) => <article className="editorial-row" key={section.title}><span>{String(index + 1).padStart(2,"0")}</span><div><h2>{section.title}</h2>{section.paragraphs.map((p) => <p key={p}>{p}</p>)}{section.bullets ? <ul>{section.bullets.map((b) => <li key={b}>{b}</li>)}</ul> : null}</div></article>)}</section>
    {page.path.includes("solution") || page.path.includes("solucion") ? <SystemMap locale={locale} /> : null}
    <section className="shell callout"><div><p className="eyebrow">{locale === "en" ? "Make it operational" : "Hazlo operativo"}</p><h2>{page.cta.label}</h2><p>{page.cta.note}</p></div><Link href={page.cta.href} className="button">{page.cta.label}</Link></section>
  </main>;
}
