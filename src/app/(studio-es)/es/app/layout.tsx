import type { ReactNode } from "react";
import { StudioShell } from "@/components/studio/studio-shell";
import { StudioAuthGate } from "@/components/studio/studio-auth-gate";

export default function StudioSpanishAppLayout({ children }: { children: ReactNode }) { return <StudioAuthGate locale="es"><StudioShell locale="es">{children}</StudioShell></StudioAuthGate>; }
