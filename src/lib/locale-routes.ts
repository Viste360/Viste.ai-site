import { insights } from "@/content/insights";
import { growthPairs } from "@/content/growth";
import { legalPages } from "@/content/legal";
import { allPages } from "@/content/pages";

const pairs: [string, string][] = [
  ["/", "/es"],
  ["/contact", "/es/contacto"],
  ["/advisor", "/es/asesor"],
  ["/insights", "/es/recursos"],
  ["/solutions/whatsapp-sales-service-control/demo", "/es/soluciones/control-ventas-servicio-whatsapp/demo"],
  ...growthPairs,
  ...allPages.filter((page) => page.locale === "en").map((page) => [page.path, page.alternatePath] as [string, string]),
  ...legalPages.filter((page) => page.locale === "en").map((page) => [page.path, page.alternatePath] as [string, string]),
  ...insights.map((insight) => [insight.path.en, insight.path.es] as [string, string]),
];

const alternate = new Map<string, string>();
for (const [english, spanish] of pairs) {
  alternate.set(english, spanish);
  alternate.set(spanish, english);
}

export function getAlternatePath(pathname: string) {
  return alternate.get(pathname) || (pathname.startsWith("/es") ? "/" : "/es");
}
