import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { displayFont } from "../fonts";
import styles from "@/components/nutrition/nutrition.module.css";

export const metadata: Metadata = {
  title: "Asesor nutricional personal privado | Viste.ai",
  description: "Vista previa privada de Viste.ai para registrar comidas, seguir la evolución del peso y recibir orientación nutricional general y cercana.",
  applicationName: "Nutrición Personal de Viste.ai",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#f1fbf8", colorScheme: "light" };

export default function NutritionSpanishLayout({ children }: { children: ReactNode }) {
  return <html lang="es"><body className={`${displayFont.variable} ${styles.nutritionBody}`}>{children}</body></html>;
}
