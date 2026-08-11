import type { OpportunitySubmission } from "./opportunity-engine";

export type IntegrationState = "unconfigured" | "configured" | "degraded";

export type CalendarSlot = {
  startsAt: string;
  endsAt: string;
  timezone: string;
  providerReference: string;
};
export interface CalendarProvider {
  readonly name: string;
  status(): Promise<IntegrationState>;
  availability(input: { from: string; to: string; timezone: string }): Promise<CalendarSlot[]>;
  book(input: { slot: CalendarSlot; name: string; email: string; confirmed: true }): Promise<{ bookingId: string; joinUrl?: string }>;
}

export interface WhatsAppProvider {
  readonly name: string;
  status(): Promise<IntegrationState>;
  verifyWebhook(input: { rawBody: string; signature: string }): Promise<boolean>;
  sendApprovedMessage(input: { recipient: string; body: string; approvalId: string }): Promise<{ messageId: string }>;
}

export interface FollowUpProvider {
  readonly name: string;
  draft(input: { opportunity: OpportunitySubmission; approvedKnowledge: string[] }): Promise<{ subject: string; body: string }>;
  send(input: { draft: { subject: string; body: string }; approvalId: string; suppressionCheckedAt: string }): Promise<{ messageId: string }>;
}

/**
 * Provider-neutral boundary for VIS_010. No adapter may send marketing, confirm a
 * booking, or create a commercial commitment without the corresponding explicit
 * confirmation/approval fields in its input.
 */
export type OpportunityIntegrations = {
  calendar?: CalendarProvider;
  whatsapp?: WhatsAppProvider;
  followUp?: FollowUpProvider;
};
