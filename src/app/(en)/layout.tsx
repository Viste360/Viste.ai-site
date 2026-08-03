import type { Metadata, Viewport } from "next";
import { LocaleRoot } from "@/components/locale-root";
import { siteUrl } from "@/content/site";
import { displayFont } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Viste.ai — AI implementation for established businesses", template: "%s | Viste.ai" },
  description: "Viste.ai designs and implements controlled AI systems for established businesses—discovery, automation, knowledge, customer operations and data.",
  applicationName: "Viste.ai",
  icons: { icon: [{ url: "/favicon_32x32.png", sizes: "32x32", type: "image/png" }], apple: "/favicon_48x48.png" },
};
export const viewport: Viewport = { themeColor: "#071415", colorScheme: "dark" };

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <LocaleRoot locale="en" bodyClassName={displayFont.variable}>{children}</LocaleRoot>;
}
