import type { Metadata } from "next";
import { StudioAssets } from "@/components/studio/studio-assets";

export const metadata: Metadata = { title: "Recursos" };
export default function StudioSpanishAssetsPage() { return <StudioAssets locale="es" />; }

