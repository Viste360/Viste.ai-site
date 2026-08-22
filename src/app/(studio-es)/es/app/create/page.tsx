import type { Metadata } from "next";
import { StudioComposer } from "@/components/studio/studio-composer";

export const metadata: Metadata = { title: "Crear" };
export default function StudioCreateSpanishPage() { return <StudioComposer locale="es" />; }
