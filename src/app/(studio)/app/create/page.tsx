import type { Metadata } from "next";
import { StudioComposer } from "@/components/studio/studio-composer";

export const metadata: Metadata = { title: "Create" };
export default function StudioCreatePage() { return <StudioComposer locale="en" />; }
