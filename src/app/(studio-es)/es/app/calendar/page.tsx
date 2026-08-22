import type { Metadata } from "next";
import { StudioCalendar } from "@/components/studio/studio-calendar";

export const metadata: Metadata = { title: "Calendario" };
export default function StudioCalendarSpanishPage() { return <StudioCalendar locale="es" />; }
