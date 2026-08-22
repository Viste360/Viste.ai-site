import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { displayFont } from "../fonts";
import styles from "@/components/studio/studio.module.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_STUDIO_URL || "https://studio.viste.ai"),
  title: { default: "Viste Studio — Una idea. Todos los canales. Siempre fiel a tu marca.", template: "%s | Viste Studio" },
  description: "Un sistema operativo de contenido con IA que transforma conocimiento empresarial aprobado en campañas de marca para múltiples canales.",
  applicationName: "Viste Studio",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
  openGraph: { title: "Viste Studio — Una idea. Todos los canales.", description: "Transforma conocimiento empresarial aprobado en campañas de marca para múltiples canales.", type: "website", images: [{ url: "/studio-og.png", width: 1672, height: 941, alt: "Flujo de campaña de Viste Studio" }] },
  twitter: { card: "summary_large_image", title: "Viste Studio", description: "Una idea. Todos los canales. Siempre fiel a tu marca.", images: ["/studio-og.png"] },
};
export const viewport: Viewport = { themeColor: "#09090b", colorScheme: "dark" };

export default function StudioSpanishRoot({ children }: { children: ReactNode }) {
  return <html lang="es"><body className={`${displayFont.variable} ${styles.studioBody}`}>{children}</body></html>;
}
