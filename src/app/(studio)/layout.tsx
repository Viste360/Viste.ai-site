import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { displayFont } from "../fonts";
import styles from "@/components/studio/studio.module.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STUDIO_URL || "https://studio.viste.ai"),
  title: { default: "Viste Studio — One idea. Every channel. Always on brand.", template: "%s | Viste Studio" },
  description: "An AI-powered content operating system that transforms approved company knowledge into branded, multi-channel campaigns.",
  applicationName: "Viste Studio",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
  openGraph: { title: "Viste Studio — One idea. Every channel. Always on brand.", description: "Transform approved company knowledge into branded, multi-channel campaigns.", type: "website", images: [{ url: "/studio-og.png", width: 1672, height: 941, alt: "Viste Studio campaign workflow" }] },
  twitter: { card: "summary_large_image", title: "Viste Studio", description: "One idea. Every channel. Always on brand.", images: ["/studio-og.png"] },
};
export const viewport: Viewport = { themeColor: "#09090b", colorScheme: "dark" };

export default function StudioEnglishRoot({ children }: { children: ReactNode }) {
  return <html lang="en"><body className={`${displayFont.variable} ${styles.studioBody}`}>{children}</body></html>;
}
