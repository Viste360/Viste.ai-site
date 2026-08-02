import type { Metadata, Viewport } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { siteUrl } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Viste.ai — AI implementation for established businesses", template: "%s | Viste.ai" },
  description: "Viste.ai designs and implements controlled AI systems for established businesses—discovery, automation, knowledge, customer operations and data.",
  applicationName: "Viste.ai",
  icons: { icon: [{ url: "/favicon_32x32.png", sizes: "32x32", type: "image/png" }], apple: "/favicon_48x48.png" },
};
export const viewport: Viewport = { themeColor: "#071415", colorScheme: "dark" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#content">Skip to content</a><LocaleFrame>{children}</LocaleFrame><CookieConsent /></body></html>;
}

function LocaleFrame({children}:{children:React.ReactNode}) { return <><div id="en-frame"><Header locale="en" /><div id="content">{children}</div><Footer locale="en" /></div></>; }
