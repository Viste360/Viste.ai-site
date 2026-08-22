import { VoicePage } from "@/components/voice/voice-page";
import { getVoiceConfig, voiceRuntimeReady } from "@/lib/voice/config";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "VISTE Voice — AI receptionist and sales concierge",
  description: "Meet Vera, VISTE’s bilingual AI voice concierge for inbound calls, requested callbacks, lead qualification, booking and human transfer.",
  path: "/voice",
  alternatePath: "/es/voz",
  locale: "en",
});

export default function Page() {
  const config = getVoiceConfig();
  return <VoicePage locale="en" demoEnabled={config.enabled && !config.globalKillSwitch} webVoiceEnabled={voiceRuntimeReady()} />;
}
