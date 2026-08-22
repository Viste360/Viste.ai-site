import type { Metadata } from "next";
import { StudioLanding } from "@/components/studio/studio-landing";

export const metadata: Metadata = { title: "Sistema operativo de contenido con IA", alternates: { canonical: "/es/studio", languages: { en: "/studio", es: "/es/studio" } } };
export default function StudioSpanishLandingPage() { return <StudioLanding locale="es" />; }

