import type { Metadata } from "next";
import { AvatarStudio } from "@/components/avatar/avatar-studio";
import { AvatarStudioAuthGate } from "@/components/avatar/avatar-studio-auth-gate";

export const metadata: Metadata = { title: "Avatar Studio" };

export default function AvatarStudioSpanishPage() {
  return <AvatarStudioAuthGate locale="es"><AvatarStudio locale="es" /></AvatarStudioAuthGate>;
}
