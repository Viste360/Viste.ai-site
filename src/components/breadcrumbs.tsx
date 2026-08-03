import Link from "next/link";
import type { Locale } from "@/content/types";

export function Breadcrumbs({ path, title, locale }: { path: string; title: string; locale: Locale }) {
  const segments = path.replace(/^\/es\/?/, "").split("/").filter(Boolean);
  const first = segments[0];
  const parents: Record<string, [string, string]> = {
    services: ["Services", "/services"], servicios: ["Servicios", "/es/servicios"],
    solutions: ["Solutions", "/solutions"], soluciones: ["Soluciones", "/es/soluciones"],
    industries: ["Industries", "/industries"], sectores: ["Sectores", "/es/sectores"],
    insights: ["Insights", "/insights"], recursos: ["Recursos", "/es/recursos"],
  };
  const parent = segments.length > 1 ? parents[first] : undefined;
  return <nav className="breadcrumbs" aria-label={locale === "en" ? "Breadcrumb" : "Migas de pan"}><ol><li><Link href={locale === "en" ? "/" : "/es"}>{locale === "en" ? "Home" : "Inicio"}</Link></li>{parent ? <li><Link href={parent[1]}>{parent[0]}</Link></li> : null}<li aria-current="page">{title}</li></ol></nav>;
}
