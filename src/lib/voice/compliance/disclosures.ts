import type { CallPurpose } from "./policy-engine";

export const VOICE_DISCLOSURE_VERSION = "vera-disclosure-2026-08-21-v1";

const inbound = {
  en: "Hi, I’m Vera, VISTE’s AI voice assistant. I can explain our services or help you arrange a conversation. How can I help?",
  es: "Hola, soy Vera, la asistente de voz con IA de VISTE. Puedo explicarte nuestros servicios o ayudarte a reservar una conversación. ¿En qué te ayudo?",
};

const requestedCallback = {
  en: "Hi, I’m Vera, VISTE’s AI voice assistant. You asked us to call so you could try the voice demo. Is now still a good time?",
  es: "Hola, soy Vera, la asistente de voz con IA de VISTE. Pediste que te llamáramos para probar la demostración de voz. ¿Te viene bien ahora?",
};

export function disclosureFor(input: { locale: "en" | "es"; purpose: CallPurpose }) {
  return input.purpose === "requested_callback" ? requestedCallback[input.locale] : inbound[input.locale];
}
