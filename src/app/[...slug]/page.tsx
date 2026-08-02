import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPage } from "@/components/contact-page";
import { EditorialPage } from "@/components/page-renderer";
import { InsightArticle, InsightsIndex } from "@/components/insights";
import { getInsight, insights } from "@/content/insights";
import { legalPages } from "@/content/legal";
import { allPages } from "@/content/pages";
import { pageMetadata } from "@/lib/site";

type Props={params:Promise<{slug:string[]}>};
function pathOf(slug:string[]){return `/${slug.join("/")}`}
export function generateStaticParams(){return [...allPages.filter(p=>p.locale==="en").map(p=>({slug:p.path.slice(1).split("/")})),...legalPages.filter(p=>p.locale==="en").map(p=>({slug:p.path.slice(1).split("/")})),...insights.map(x=>({slug:x.path.en.slice(1).split("/")})),{slug:["insights"]},{slug:["contact"]}]}
export async function generateMetadata({params}:Props):Promise<Metadata>{const path=pathOf((await params).slug);if(path==="/contact")return pageMetadata({title:"Discuss your AI use case",description:"Tell Viste.ai where work gets stuck and get an honest recommendation for the right first AI implementation step.",path,alternatePath:"/es/contacto",locale:"en"});if(path==="/insights")return pageMetadata({title:"AI implementation insights",description:"Practical guidance on AI use cases, operating models, human oversight and production delivery.",path,alternatePath:"/es/recursos",locale:"en"});const page=[...allPages,...legalPages].find(p=>p.path===path);if(page)return pageMetadata({title:page.title,description:page.description,path,alternatePath:page.alternatePath,locale:"en"});const found=getInsight(path);if(found)return pageMetadata({title:found.insight.title.en,description:found.insight.description.en,path,alternatePath:found.insight.path.es,locale:"en"});return {};}
export default async function Page({params}:Props){const path=pathOf((await params).slug);if(path==="/contact")return <ContactPage locale="en"/>;if(path==="/insights")return <InsightsIndex locale="en"/>;const definition=[...allPages,...legalPages].find(p=>p.path===path);if(definition)return <EditorialPage page={definition}/>;const found=getInsight(path);if(found)return <InsightArticle insight={found.insight} locale="en"/>;notFound()}
