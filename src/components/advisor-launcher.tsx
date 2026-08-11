"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdvisorLauncher({ locale }: { locale: "en" | "es" }) {
  const pathname = usePathname();
  const advisorPath = locale === "es" ? "/es/asesor" : "/advisor";
  if (pathname === advisorPath || pathname.startsWith("/admin")) return null;
  return <Link className="advisor-launcher" href={advisorPath} aria-label={locale === "es" ? "Encuentra el punto de partida adecuado para IA" : "Find the right AI starting point"}>
    <span aria-hidden="true">✦</span>
    {locale === "es" ? "Encuentra tu punto de partida" : "Find the right AI starting point"}
  </Link>;
}
