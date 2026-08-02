import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPage } from "@/components/contact-page";
import { EditorialPage } from "@/components/page-renderer";
import { InsightArticle, InsightsIndex } from "@/components/insights";
import { getInsight, insights } from "@/content/insights";
import { legalPages } from "@/content/legal";
import { allPages } from "@/content/pages";
import { pageMetadata } from "@/lib/site";
type Props={params:Promise<{slug:string[]}>};function pathOf(slug:string[]){return `/es/${slug.join("/")}`}
export function generateStaticParams(){return [...allPages.filter(p=>p.locale==="es").map(p=>({slug:p.path.replace(/^\/es\//,"").split("/")})),...legalPages.filter(p=>p.locale==="es").map(p=>({slug:p.path.replace(/^\/es\//,"").split("/")})),...insights.map(x=>({slug:x.path.es.replace(/^\/es\//,"").split("/")})),{slug:["recursos"]},{slug:["contacto"]}]}
export async function generateMetadata({params}:Props):Promise<Metadata>{const path=pathOf((await params).slug);if(path==="/es/contacto")return pageMetadata({title:"Cuéntanos tu caso de uso de IA",description:"Explícanos dónde se atasca el trabajo y recibe una recomendación honesta sobre el primer paso.",path,alternatePath:"/contact",locale:"es"});if(path==="/es/recursos")return pageMetadata({title:"Recursos de implementación de IA",description:"Orientación práctica sobre casos, modelos operativos, supervisión humana y producción.",path,alternatePath:"/insights",locale:"es"});const page=[...allPages,...legalPages].find(p=>p.path===path);if(page)return pageMetadata({title:page.title,description:page.description,path,alternatePath:page.alternatePath,locale:"es"});const found=getInsight(path);if(found)return pageMetadata({title:found.insight.title.es,description:found.insight.description.es,path,alternatePath:found.insight.path.en,locale:"es"});return {};}
export default async function Page({params}:Props){const path=pathOf((await params).slug);if(path==="/es/contacto")return <ContactPage locale="es"/>;if(path==="/es/recursos")return <InsightsIndex locale="es"/>;const definition=[...allPages,...legalPages].find(p=>p.path===path);if(definition)return <EditorialPage page={definition}/>;const found=getInsight(path);if(found)return <InsightArticle insight={found.insight} locale="es"/>;notFound()}
