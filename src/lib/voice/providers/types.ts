import type { PolicyDecision } from "../compliance/policy-engine";

export type ProviderName = "elevenlabs" | "openai-realtime";

export type ExternalAgent = {
  provider: ProviderName;
  externalId: string;
  name?: string;
  raw?: Record<string, unknown>;
};

export type ExternalCall = {
  provider: ProviderName;
  externalId: string;
  telephonyCallId?: string;
  status: string;
};

export type NormalizedCall = {
  provider: ProviderName;
  externalId: string;
  agentExternalId?: string;
  status: string;
  durationSeconds?: number;
  costAmount?: number;
  startedAt?: string;
};

export type VerifiedVoiceEvent = {
  provider: ProviderName;
  eventType: string;
  eventId: string;
  occurredAt: string;
  agentExternalId?: string;
  callExternalId?: string;
  redactedPayload: Record<string, unknown>;
};

export type CreateVoiceAgentInput = {
  name: string;
  conversationConfig: Record<string, unknown>;
  tags?: string[];
};

export type UpdateVoiceAgentInput = CreateVoiceAgentInput & { externalAgentId: string };
export type PublishVoiceAgentInput = UpdateVoiceAgentInput & { versionNote: string };
export type StartOutboundCallInput = {
  externalAgentId: string;
  externalPhoneNumberId: string;
  toNumber: string;
  policyDecision: PolicyDecision;
  dynamicVariables?: Record<string, string | number | boolean>;
  recordingEnabled?: boolean;
};

export interface VoiceProvider {
  createAgent(input: CreateVoiceAgentInput): Promise<ExternalAgent>;
  updateAgent(input: UpdateVoiceAgentInput): Promise<ExternalAgent>;
  publishAgent(input: PublishVoiceAgentInput): Promise<void>;
  startOutboundCall(input: StartOutboundCallInput): Promise<ExternalCall>;
  endCall(input: { externalCallId: string }): Promise<void>;
  getCall(input: { externalCallId: string }): Promise<NormalizedCall>;
  verifyWebhook(input: { rawBody: string; signatureHeader: string | null }): Promise<VerifiedVoiceEvent>;
}
