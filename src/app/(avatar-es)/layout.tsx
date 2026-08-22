import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { displayFont } from "../fonts";
import styles from "@/components/avatar/avatar.module.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_AVATAR_URL || "https://avatar.viste.ai"),
  title: { default: "Michael Live Coach — Viste.ai", template: "%s | Michael Live Coach" },
  description: "Vista previa privada de Viste.ai de coaching de movimiento local con vídeos pre-generados de Michael.",
  applicationName: "Michael Live Coach",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#0c0f0d", colorScheme: "dark" };

export default function AvatarSpanishLayout({ children }: { children: ReactNode }) {
  return <html lang="es"><body className={`${displayFont.variable} ${styles.avatarBody}`}>{children}</body></html>;
}
