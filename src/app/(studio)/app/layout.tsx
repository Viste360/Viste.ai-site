import type { ReactNode } from "react";
import { StudioShell } from "@/components/studio/studio-shell";
import { StudioAuthGate } from "@/components/studio/studio-auth-gate";

export default function StudioAppLayout({ children }: { children: ReactNode }) { return <StudioAuthGate locale="en"><StudioShell locale="en">{children}</StudioShell></StudioAuthGate>; }
