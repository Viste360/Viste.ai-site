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
function pathOf(slug: string[]) { return `/${slug.join("/")}`; }
const demoPath = "/solutions/whatsapp-sales-service-control/demo";
const localWebsitesPath = "/services/websites-for-local-businesses";

export function generateStaticParams() { return [...allPages.filter((page) => page.locale === "en").map((page) => ({ slug: page.path.slice(1).split("/") })), ...legalPages.filter((page) => page.locale === "en").map((page) => ({ slug: page.path.slice(1).split("/") })), ...growthPages.filter((page) => page.locale === "en").map((page) => ({ slug: page.path.slice(1).split("/") })), ...insights.map((insight) => ({ slug: insight.path.en.slice(1).split("/") })), { slug: ["insights"] }, { slug: ["contact"] }, { slug: ["advisor"] }, { slug: demoPath.slice(1).split("/") }]; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = pathOf((await params).slug);
  if (path === "/contact") return pageMetadata({ title: "Discuss your AI use case", description: "Tell Viste.ai which workflow should work better and securely qualify the right first implementation step.", path, alternatePath: "/es/contacto", locale: "en" });
  if (path === "/advisor") return pageMetadata({ title: "Viste AI Opportunity Advisor", description: "Turn an operational problem into a structured Viste Opportunity Brief with deterministic fit scoring and a responsible next step.", path, alternatePath: "/es/asesor", locale: "en" });
  if (path === "/insights") return pageMetadata({ title: "AI implementation insights", description: "Practical guidance on AI use cases, operating models, human oversight and production delivery.", path, alternatePath: "/es/recursos", locale: "en" });
  if (path === demoPath) return pageMetadata({ title: "Interactive WhatsApp sales and service control demo", description: "Explore an illustrative shared inbox with assignment, response timers, AI drafts, human approval, supervisor metrics and CRM handoff.", path, alternatePath: "/es/soluciones/control-ventas-servicio-whatsapp/demo", locale: "en" });
  const growthPage = getGrowthPage(path);
  if (growthPage) return pageMetadata({ title: growthPage.title, description: growthPage.description, path, alternatePath: growthPage.alternatePath, locale: "en", noIndex: !growthPage.publishApproved });
  const page = [...allPages, ...legalPages].find((entry) => entry.path === path);
  if (page) return pageMetadata({ title: page.title, description: page.description, path, alternatePath: page.alternatePath, locale: "en" });
  const found = getInsight(path);
  if (found) return pageMetadata({ title: found.insight.title.en, description: found.insight.description.en, path, alternatePath: found.insight.path.es, locale: "en", type: "article" });
  return {};
}

export default async function Page({ params }: Props) {
  const path = pathOf((await params).slug);
  if (path === "/contact") return <ContactPage locale="en" />;
  if (path === "/advisor") return <AdvisorPage locale="en" />;
  if (path === "/insights") return <InsightsIndex locale="en" />;
  if (path === demoPath) return <WhatsAppDemo locale="en" />;
  if (path === localWebsitesPath) return <LocalBusinessWebsites locale="en" />;
  const growthPage = getGrowthPage(path);
  if (growthPage?.key === "opportunity") return <OpportunityPage page={growthPage} />;
  if (growthPage?.key === "roi") return <RoiCalculatorPage page={growthPage} />;
  if (growthPage?.key === "questions") return <QuestionsHub page={growthPage} />;
  const definition = [...allPages, ...legalPages].find((entry) => entry.path === path);
  if (definition) return <EditorialPage page={definition} />;
  const found = getInsight(path);
  if (found) return <InsightArticle insight={found.insight} locale="en" />;
  notFound();
}
