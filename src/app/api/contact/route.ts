import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { contactSchema } from "@/lib/contact";

const attempts = new Map<string,{count:number;reset:number}>();
const runtimeSalt=process.env.CONTACT_IP_SALT||randomUUID();
function limited(key:string){const now=Date.now();const value=attempts.get(key);if(!value||value.reset<now){attempts.set(key,{count:1,reset:now+15*60_000});return false}value.count+=1;return value.count>5}
function safeText(value:string){return value.replace(/[<>]/g,"").slice(0,4000)}

export async function POST(request:NextRequest){
  const origin=request.headers.get("origin");if(origin&&new URL(origin).host!==request.nextUrl.host)return NextResponse.json({error:"Invalid origin"},{status:403});
  if(!request.headers.get("content-type")?.includes("application/json"))return NextResponse.json({error:"Unsupported content type"},{status:415});
  const length=Number(request.headers.get("content-length")||0);if(length>20_000)return NextResponse.json({error:"Request too large"},{status:413});
  let json:unknown;try{json=await request.json()}catch{return NextResponse.json({error:"Invalid request"},{status:400})}
  const parsed=contactSchema.safeParse(json);if(!parsed.success)return NextResponse.json({error:"Please review the required fields"},{status:400});
  const input=parsed.data;if(input.website||Date.now()-input.startedAt<2500)return NextResponse.json({ok:true});
  const ip=request.headers.get("x-forwarded-for")?.split(",")[0]||"unknown";const ipHash=createHash("sha256").update(`${runtimeSalt}:${ip}`).digest("hex");if(limited(ipHash))return NextResponse.json({error:"Too many attempts"},{status:429});
  const id=randomUUID(); const receivedAt=new Date().toISOString(); let delivered=false;
  const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL; const serviceKey=process.env.SUPABASE_SECRET_KEY;
  if(supabaseUrl&&serviceKey){const supabase=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});const {error}=await supabase.from("leads").insert({id,name:input.name,email:input.email,company:input.company,role:input.role||null,country:input.country||null,phone:input.phone||null,challenge:input.challenge,budget:input.budget,timeline:input.timeline,locale:input.locale,consent_at:receivedAt,source:"website",source_url:input.sourceUrl,referrer:input.referrer||null,utm_source:input.utmSource||null,utm_medium:input.utmMedium||null,utm_campaign:input.utmCampaign||null,ip_hash:ipHash,status:"new"});if(!error)delivered=true;else console.error("Lead storage failed",error.code);}
  if(process.env.RESEND_API_KEY&&process.env.CONTACT_NOTIFICATION_EMAIL){const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:process.env.CONTACT_FROM_EMAIL||"Viste.ai Website <website@viste.ai>",to:[process.env.CONTACT_NOTIFICATION_EMAIL],reply_to:input.email,subject:`New Viste.ai enquiry — ${safeText(input.company)}`,text:[`Reference: ${id}`,`Received: ${receivedAt}`,`Name: ${safeText(input.name)}`,`Email: ${safeText(input.email)}`,`Company: ${safeText(input.company)}`,`Role: ${safeText(input.role)}`,`Country: ${safeText(input.country)}`,`Phone: ${safeText(input.phone)}`,`Budget: ${input.budget}`,`Timeline: ${input.timeline}`,"","Challenge:",safeText(input.challenge)].join("\n")})});if(response.ok)delivered=true;else console.error("Lead notification failed",response.status);}
  if(!delivered)return NextResponse.json({error:"Contact service is not configured",fallback:"mailto:hello@viste.ai"},{status:503});
  return NextResponse.json({ok:true,reference:id},{status:201,headers:{"Cache-Control":"no-store"}});
}
