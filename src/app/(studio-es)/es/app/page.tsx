import type { Metadata } from "next";
import { StudioDashboard } from "@/components/studio/studio-dashboard";

export const metadata: Metadata = { title: "Espacio de trabajo" };
export default function StudioSpanishAppPage() { return <StudioDashboard locale="es" />; }

