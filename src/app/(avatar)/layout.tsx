import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { displayFont } from "../fonts";
import styles from "@/components/avatar/avatar.module.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_AVATAR_URL || "https://avatar.viste.ai"),
  title: { default: "Michael Live Coach — Viste.ai", template: "%s | Michael Live Coach" },
  description: "A private Viste.ai preview of responsive, on-device movement coaching with pre-generated Michael video cues.",
  applicationName: "Michael Live Coach",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#0c0f0d", colorScheme: "dark" };

export default function AvatarEnglishLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body className={`${displayFont.variable} ${styles.avatarBody}`}>{children}</body></html>;
}
