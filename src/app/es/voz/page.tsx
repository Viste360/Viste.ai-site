import { VoicePage } from "@/components/voice/voice-page";
import { getVoiceConfig, voiceRuntimeReady } from "@/lib/voice/config";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "VISTE Voice — Recepcionista y asistente comercial con IA",
  description: "Conoce a Vera, la asistente de voz bilingüe de VISTE para llamadas entrantes, callbacks solicitados, cualificación, reservas y transferencia humana.",
  path: "/es/voz",
  alternatePath: "/voice",
  locale: "es",
});

export default function Page() {
  const config = getVoiceConfig();
  return <VoicePage locale="es" demoEnabled={config.enabled && !config.globalKillSwitch} webVoiceEnabled={voiceRuntimeReady()} />;
}
