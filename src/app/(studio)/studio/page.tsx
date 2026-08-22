import type { Metadata } from "next";
import { StudioLanding } from "@/components/studio/studio-landing";

export const metadata: Metadata = { title: "AI content operating system", alternates: { canonical: "/studio", languages: { en: "/studio", es: "/es/studio" } } };
export default function StudioLandingPage() { return <StudioLanding locale="en" />; }

