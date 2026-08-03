import Image from "next/image";
import { approvedFounder } from "@/lib/public-config";

export function FounderProfile({ locale }: { locale: "en" | "es" }) {
  if (!approvedFounder) return null;
  return <section className="shell founder-profile" aria-labelledby="founder-profile-title"><p className="eyebrow">{locale === "en" ? "Senior practitioner" : "Profesional senior"}</p><div><div>{approvedFounder.imageUrl ? <Image unoptimized src={approvedFounder.imageUrl} alt="" width={240} height={240} /> : null}</div><div><h2 id="founder-profile-title">{approvedFounder.name}</h2><strong>{approvedFounder.role}</strong><p>{approvedFounder.bio}</p>{approvedFounder.profileUrl ? <a className="text-link" href={approvedFounder.profileUrl} target="_blank" rel="noreferrer">{locale === "en" ? "Verified professional profile ↗" : "Perfil profesional verificado ↗"}</a> : null}</div></div></section>;
}
