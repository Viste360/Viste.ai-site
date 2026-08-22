import type { Metadata } from "next";
import { StudioCalendar } from "@/components/studio/studio-calendar";

export const metadata: Metadata = { title: "Calendar" };
export default function StudioCalendarPage() { return <StudioCalendar locale="en" />; }
