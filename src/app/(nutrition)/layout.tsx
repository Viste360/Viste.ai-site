import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { displayFont } from "../fonts";
import styles from "@/components/nutrition/nutrition.module.css";

export const metadata: Metadata = {
  title: "Private personal nutrition coach | Viste.ai",
  description: "Private Viste.ai preview for personal meal logging, weight trends and supportive general nutrition guidance.",
  applicationName: "Viste.ai Personal Nutrition",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#f1fbf8", colorScheme: "light" };

export default function NutritionEnglishLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body className={`${displayFont.variable} ${styles.nutritionBody}`}>{children}</body></html>;
}
