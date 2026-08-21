import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPage } from "@/components/contact-page";
import { InsightArticle, InsightsIndex } from "@/components/insights";
import { EditorialPage } from "@/components/page-renderer";
import { OpportunityPage } from "@/components/opportunity-page";
import { QuestionsHub } from "@/components/questions-hub";
import { RoiCalculatorPage } from "@/components/roi-calculator-page";
import { WhatsAppDemo } from "@/components/whatsapp-demo";
import { AdvisorPage } from "@/components/advisor-page";
import { LocalBusinessWebsites } from "@/components/local-business-websites";
import { getGrowthPage, growthPages } from "@/content/growth";
import { getInsight, insights } from "@/content/insights";
import { legalPages } from "@/content/legal";
import { allPages } from "@/content/pages";
import { pageMetadata } from "@/lib/site";

type Props = { params: Promise<{ slug: string[] }> };
function pathOf(slug: string[]) { return `/es/${slug.join("/")}`; }
const demoPath = "/es/soluciones/control-ventas-servicio-whatsapp/demo";
const localWebsitesPath = "/es/servicios/paginas-web-negocios-locales";

export function generateStaticParams() { return [...allPages.filter((page) => page.locale === "es").map((page) => ({ slug: page.path.replace(/^\/es\//, "").split("/") })), ...legalPages.filter((page) => page.locale === "es").map((page) => ({ slug: page.path.replace(/^\/es\//, "").split("/") })), ...growthPages.filter((page) => page.locale === "es").map((page) => ({ slug: page.path.replace(/^\/es\//, "").split("/") })), ...insights.map((insight) => ({ slug: insight.path.es.replace(/^\/es\//, "").split("/") })), { slug: ["recursos"] }, { slug: ["contacto"] }, { slug: ["asesor"] }, { slug: demoPath.replace(/^\/es\//, "").split("/") }]; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = pathOf((await params).slug);
  if (path === "/es/contacto") return pageMetadata({ title: "Cuéntanos tu caso de uso de IA", description: "Describe el flujo que debe funcionar mejor y cualifica de forma segura el primer paso de implementación.", path, alternatePath: "/contact", locale: "es" });
  if (path === "/es/asesor") return pageMetadata({ title: "Asesor de Oportunidades de IA de Viste", description: "Convierte un problema operativo en un Brief de Oportunidad con puntuación determinista y un siguiente paso responsable.", path, alternatePath: "/advisor", locale: "es" });
  if (path === "/es/recursos") return pageMetadata({ title: "Recursos de implementación de IA", description: "Orientación práctica sobre casos, modelos operativos, supervisión humana y producción.", path, alternatePath: "/insights", locale: "es" });
  if (path === demoPath) return pageMetadata({ title: "Demo interactiva de control de ventas y servicio por WhatsApp", description: "Explora una bandeja ilustrativa con asignación, tiempos de respuesta, borradores de IA, aprobación humana, métricas y traspaso a CRM.", path, alternatePath: "/solutions/whatsapp-sales-service-control/demo", locale: "es" });
  const growthPage = getGrowthPage(path);
  if (growthPage) return pageMetadata({ title: growthPage.title, description: growthPage.description, path, alternatePath: growthPage.alternatePath, locale: "es", noIndex: !growthPage.publishApproved });
  const page = [...allPages, ...legalPages].find((entry) => entry.path === path);
  if (page) return pageMetadata({ title: page.title, description: page.description, path, alternatePath: page.alternatePath, locale: "es" });
  const found = getInsight(path);
  if (found) return pageMetadata({ title: found.insight.title.es, description: found.insight.description.es, path, alternatePath: found.insight.path.en, locale: "es", type: "article" });
  return {};
}

export default async function Page({ params }: Props) {
  const path = pathOf((await params).slug);
  if (path === "/es/contacto") return <ContactPage locale="es" />;
  if (path === "/es/asesor") return <AdvisorPage locale="es" />;
  if (path === "/es/recursos") return <InsightsIndex locale="es" />;
  if (path === demoPath) return <WhatsAppDemo locale="es" />;
  if (path === localWebsitesPath) return <LocalBusinessWebsites locale="es" />;
  const growthPage = getGrowthPage(path);
  if (growthPage?.key === "opportunity") return <OpportunityPage page={growthPage} />;
  if (growthPage?.key === "roi") return <RoiCalculatorPage page={growthPage} />;
  if (growthPage?.key === "questions") return <QuestionsHub page={growthPage} />;
  const definition = [...allPages, ...legalPages].find((entry) => entry.path === path);
  if (definition) return <EditorialPage page={definition} />;
  const found = getInsight(path);
  if (found) return <InsightArticle insight={found.insight} locale="es" />;
  notFound();
}
