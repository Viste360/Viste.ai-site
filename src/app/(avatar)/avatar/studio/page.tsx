import type { Metadata } from "next";
import { AvatarStudio } from "@/components/avatar/avatar-studio";
import { AvatarStudioAuthGate } from "@/components/avatar/avatar-studio-auth-gate";

export const metadata: Metadata = { title: "Avatar Studio" };

export default function AvatarStudioPage() {
  return <AvatarStudioAuthGate locale="en"><AvatarStudio locale="en" /></AvatarStudioAuthGate>;
}
