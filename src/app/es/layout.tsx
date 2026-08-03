import type { Metadata, Viewport } from "next";
import { LocaleRoot } from "@/components/locale-root";
import { siteUrl } from "@/content/site";
import { displayFont } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Viste.ai — Implementación de IA para empresas consolidadas", template: "%s | Viste.ai" },
  description: "Viste.ai diseña e implementa sistemas de IA controlados para empresas consolidadas: diagnóstico, automatización, conocimiento, operaciones de cliente y datos.",
  applicationName: "Viste.ai",
  icons: { icon: [{ url: "/favicon_32x32.png", sizes: "32x32", type: "image/png" }], apple: "/favicon_48x48.png" },
};
export const viewport: Viewport = { themeColor: "#071415", colorScheme: "dark" };

export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  return <LocaleRoot locale="es" bodyClassName={displayFont.variable}>{children}</LocaleRoot>;
}
