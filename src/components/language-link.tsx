"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAlternatePath } from "@/lib/locale-routes";

export function LanguageLink({ locale, className, children, onClick, tabIndex }: { locale: "en" | "es"; className?: string; children: React.ReactNode; onClick?: () => void; tabIndex?: number }) {
  const pathname = usePathname();
  return <Link className={className} href={getAlternatePath(pathname)} hrefLang={locale === "en" ? "es" : "en"} onClick={onClick} tabIndex={tabIndex}>{children}</Link>;
}
