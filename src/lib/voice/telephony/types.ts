import type { OutboundPolicyInput, PolicyDecision } from "../compliance/policy-engine";

export type ExternalNumber = {
  provider: "twilio" | "sip";
  externalId: string;
  e164Number: string;
  status: string;
};

export interface TelephonyProvider {
  provisionNumber(input: { e164Number: string; explicitlyApproved: boolean }): Promise<ExternalNumber>;
  attachNumber(input: { externalNumberId: string; webhookUrl: string; explicitlyApproved: boolean }): Promise<void>;
  releaseNumber(input: { externalNumberId: string; explicitlyApproved: boolean }): Promise<void>;
  validateOutboundPolicy(input: OutboundPolicyInput): Promise<PolicyDecision>;
}
