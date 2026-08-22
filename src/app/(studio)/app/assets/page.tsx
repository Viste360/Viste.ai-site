import type { Metadata } from "next";
import { StudioAssets } from "@/components/studio/studio-assets";

export const metadata: Metadata = { title: "Assets" };
export default function StudioAssetsPage() { return <StudioAssets locale="en" />; }

