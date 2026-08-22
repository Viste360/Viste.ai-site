import { createHash } from "node:crypto";
import { redactProviderEvent, verifyElevenLabsSignature } from "../security";
import type {
  CreateVoiceAgentInput,
  ExternalAgent,
  ExternalCall,
  NormalizedCall,
  PublishVoiceAgentInput,
  StartOutboundCallInput,
  UpdateVoiceAgentInput,
  VerifiedVoiceEvent,
  VoiceProvider,
} from "./types";

type Fetcher = typeof fetch;

type ElevenLabsProviderOptions = {
  apiKey: string;
  webhookSecret: string;
  fetcher?: Fetcher;
  baseUrl?: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export class ElevenLabsVoiceProvider implements VoiceProvider {
  private readonly fetcher: Fetcher;
  private readonly baseUrl: string;

  constructor(private readonly options: ElevenLabsProviderOptions) {
    if (!options.apiKey) throw new Error("ElevenLabs API key is required");
    this.fetcher = options.fetcher || fetch;
    this.baseUrl = options.baseUrl || "https://api.elevenlabs.io";
  }

  private async request(path: string, init: RequestInit = {}) {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "xi-api-key": this.options.apiKey,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
      cache: "no-store",
      signal: init.signal || AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`ElevenLabs request failed (${response.status})`);
    if (response.status === 204) return {};
    return asRecord(await response.json().catch(() => ({})));
  }

  async createAgent(input: CreateVoiceAgentInput): Promise<ExternalAgent> {
    const result = await this.request("/v1/convai/agents/create", {
      method: "POST",
      body: JSON.stringify({ name: input.name, conversation_config: input.conversationConfig, tags: input.tags || ["viste-voice"] }),
    });
    const externalId = text(result.agent_id);
    if (!externalId) throw new Error("ElevenLabs did not return an agent id");
    return { provider: "elevenlabs", externalId, name: input.name, raw: result };
  }

  async updateAgent(input: UpdateVoiceAgentInput): Promise<ExternalAgent> {
    const result = await this.request(`/v1/convai/agents/${encodeURIComponent(input.externalAgentId)}`, {
      method: "PATCH",
      body: JSON.stringify({ name: input.name, conversation_config: input.conversationConfig, tags: input.tags || ["viste-voice"] }),
    });
    return { provider: "elevenlabs", externalId: text(result.agent_id) || input.externalAgentId, name: text(result.name) || input.name, raw: result };
  }

  async publishAgent(input: PublishVoiceAgentInput) {
    await this.updateAgent(input);
  }

  async startOutboundCall(input: StartOutboundCallInput): Promise<ExternalCall> {
    if (!input.policyDecision.allowed) throw new Error(`Outbound call denied: ${input.policyDecision.reasons.join(",")}`);
    const result = await this.request("/v1/convai/twilio/outbound-call", {
      method: "POST",
      body: JSON.stringify({
        agent_id: input.externalAgentId,
        agent_phone_number_id: input.externalPhoneNumberId,
        to_number: input.toNumber,
        call_recording_enabled: input.recordingEnabled === true,
        conversation_initiation_client_data: {
          dynamic_variables: {
            ...input.dynamicVariables,
            viste_policy_version: input.policyDecision.policyVersion,
          },
        },
      }),
    });
    const externalId = text(result.conversation_id);
    if (!externalId) throw new Error("ElevenLabs did not return a conversation id");
    return { provider: "elevenlabs", externalId, telephonyCallId: text(result.callSid), status: result.success === true ? "initiated" : "failed" };
  }

  async endCall() {
    throw new Error("Ending a live ElevenLabs call requires the monitored-session control channel and is not enabled in the Vercel adapter");
  }

  async getCall(input: { externalCallId: string }): Promise<NormalizedCall> {
    const result = await this.request(`/v1/convai/conversations/${encodeURIComponent(input.externalCallId)}`);
    const metadata = asRecord(result.metadata);
    const started = number(metadata.start_time_unix_secs);
    return {
      provider: "elevenlabs",
      externalId: text(result.conversation_id) || input.externalCallId,
      agentExternalId: text(result.agent_id),
      status: text(result.status) || "unknown",
      durationSeconds: number(metadata.call_duration_secs),
      costAmount: number(metadata.cost_fiat),
      startedAt: started ? new Date(started * 1_000).toISOString() : undefined,
    };
  }

  async verifyWebhook(input: { rawBody: string; signatureHeader: string | null }): Promise<VerifiedVoiceEvent> {
    if (!verifyElevenLabsSignature({ ...input, secret: this.options.webhookSecret })) throw new Error("Invalid ElevenLabs signature");
    const payload = asRecord(JSON.parse(input.rawBody));
    const data = asRecord(payload.data);
    const eventType = text(payload.type) || "unknown";
    const timestamp = number(payload.event_timestamp);
    const occurredAt = timestamp ? new Date(timestamp * 1_000).toISOString() : new Date().toISOString();
    const callExternalId = text(data.conversation_id);
    const eventId = createHash("sha256").update(`${eventType}:${callExternalId || "none"}:${timestamp || "none"}`).digest("hex");
    return {
      provider: "elevenlabs",
      eventType,
      eventId,
      occurredAt,
      agentExternalId: text(data.agent_id),
      callExternalId,
      redactedPayload: redactProviderEvent({ ...data, event_timestamp: timestamp, type: eventType }),
    };
  }
}
