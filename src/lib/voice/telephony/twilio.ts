import { evaluateCallPolicy, type OutboundPolicyInput } from "../compliance/policy-engine";
import type { ExternalNumber, TelephonyProvider } from "./types";

type TwilioOptions = {
  accountSid: string;
  apiKeySid: string;
  apiKeySecret: string;
  fetcher?: typeof fetch;
};

export class TwilioTelephonyProvider implements TelephonyProvider {
  private readonly fetcher: typeof fetch;

  constructor(private readonly options: TwilioOptions) {
    this.fetcher = options.fetcher || fetch;
  }

  private async request(path: string, init: RequestInit) {
    const authorization = Buffer.from(`${this.options.apiKeySid}:${this.options.apiKeySecret}`).toString("base64");
    const response = await this.fetcher(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(this.options.accountSid)}${path}`, {
      ...init,
      headers: { Authorization: `Basic ${authorization}`, "Content-Type": "application/x-www-form-urlencoded", ...init.headers },
      cache: "no-store",
      signal: init.signal || AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`Twilio request failed (${response.status})`);
    return response.status === 204 ? {} : await response.json() as Record<string, unknown>;
  }

  async provisionNumber(input: { e164Number: string; explicitlyApproved: boolean }): Promise<ExternalNumber> {
    if (!input.explicitlyApproved) throw new Error("Telephone provisioning requires explicit approval");
    const body = new URLSearchParams({ PhoneNumber: input.e164Number });
    const result = await this.request("/IncomingPhoneNumbers.json", { method: "POST", body });
    if (typeof result.sid !== "string" || typeof result.phone_number !== "string") throw new Error("Twilio did not return the provisioned number");
    return { provider: "twilio", externalId: result.sid, e164Number: result.phone_number, status: "provisioned" };
  }

  async attachNumber(input: { externalNumberId: string; webhookUrl: string; explicitlyApproved: boolean }) {
    if (!input.explicitlyApproved) throw new Error("Telephone routing changes require explicit approval");
    const body = new URLSearchParams({ VoiceUrl: input.webhookUrl, VoiceMethod: "POST" });
    await this.request(`/IncomingPhoneNumbers/${encodeURIComponent(input.externalNumberId)}.json`, { method: "POST", body });
  }

  async releaseNumber(input: { externalNumberId: string; explicitlyApproved: boolean }) {
    if (!input.explicitlyApproved) throw new Error("Telephone release requires explicit approval");
    await this.request(`/IncomingPhoneNumbers/${encodeURIComponent(input.externalNumberId)}.json`, { method: "DELETE" });
  }

  async validateOutboundPolicy(input: OutboundPolicyInput) {
    return evaluateCallPolicy(input);
  }
}
