import Link from "next/link";

export function Logo({ locale = "en" }: { locale?: "en" | "es" }) {
  return <Link className="logo" href={locale === "es" ? "/es" : "/"} aria-label="Viste.ai home"><span className="logo-mark" aria-hidden="true"><i /><i /><i /></span><span>viste<span>.ai</span></span></Link>;
}
