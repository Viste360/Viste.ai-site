import type { Metadata, Viewport } from "next";
import { LocaleRoot } from "@/components/locale-root";
import { siteUrl } from "@/content/site";
import { displayFont } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Implementación y automatización de IA para empresas | Viste.ai", template: "%s | Viste.ai" },
  description: "Viste.ai diseña e implementa sistemas de IA controlados para empresas consolidadas: diagnóstico, automatización, conocimiento, operaciones de cliente y datos.",
  applicationName: "Viste.ai",
  icons: {
    icon: [
      { url: "/favicon.svg?v=viste-20260804", type: "image/svg+xml" },
      { url: "/favicon_32x32.png?v=viste-20260804", sizes: "32x32", type: "image/png" },
      { url: "/favicon_16x16.png?v=viste-20260804", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico?v=viste-20260804", sizes: "32x32", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico?v=viste-20260804",
    apple: [{ url: "/apple-touch-icon.png?v=viste-20260804", sizes: "180x180", type: "image/png" }],
  },
};
export const viewport: Viewport = { themeColor: "#071415", colorScheme: "dark" };

export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  return <LocaleRoot locale="es" bodyClassName={displayFont.variable}>{children}</LocaleRoot>;
}
