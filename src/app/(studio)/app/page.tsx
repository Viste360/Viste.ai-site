import type { Metadata } from "next";
import { StudioDashboard } from "@/components/studio/studio-dashboard";

export const metadata: Metadata = { title: "Workspace" };
export default function StudioAppPage() { return <StudioDashboard locale="en" />; }

