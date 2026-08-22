function clean(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed && !/^(replace|example|placeholder|tbd)/i.test(trimmed) ? trimmed : undefined;
}

function safePublicUrl(value: string | undefined) {
  const candidate = clean(value);
  if (!candidate) return undefined;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export const publicConfig = {
  bookingUrl: safePublicUrl(process.env.NEXT_PUBLIC_BOOKING_URL),
  whatsappUrl: safePublicUrl(process.env.NEXT_PUBLIC_WHATSAPP_URL) || "https://wa.me/message/5IYX266Z5KPKK1",
  turnstileSiteKey: clean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
  searchVerification: {
    google: clean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION),
    bing: clean(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION),
  },
  legalOperator: {
    companyName: clean(process.env.NEXT_PUBLIC_LEGAL_COMPANY_NAME),
    companyNumber: clean(process.env.NEXT_PUBLIC_LEGAL_COMPANY_NUMBER),
    registeredAddress: clean(process.env.NEXT_PUBLIC_LEGAL_REGISTERED_ADDRESS),
    taxVat: clean(process.env.NEXT_PUBLIC_LEGAL_TAX_VAT),
    privacyContact: clean(process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL) || "privacy@viste.ai",
    securityContact: clean(process.env.NEXT_PUBLIC_SECURITY_CONTACT_EMAIL) || "security@viste.ai",
  },
  sprint: {
    duration: clean(process.env.NEXT_PUBLIC_SPRINT_DURATION),
    participants: clean(process.env.NEXT_PUBLIC_SPRINT_PARTICIPANTS),
    deliverables: clean(process.env.NEXT_PUBLIC_SPRINT_DELIVERABLES),
    startingInvestment: clean(process.env.NEXT_PUBLIC_SPRINT_STARTING_INVESTMENT),
  },
};

const founder = {
  name: clean(process.env.NEXT_PUBLIC_FOUNDER_NAME),
  role: clean(process.env.NEXT_PUBLIC_FOUNDER_ROLE),
  bio: clean(process.env.NEXT_PUBLIC_FOUNDER_BIO),
  imageUrl: safePublicUrl(process.env.NEXT_PUBLIC_FOUNDER_IMAGE_URL),
  profileUrl: safePublicUrl(process.env.NEXT_PUBLIC_FOUNDER_PROFILE_URL),
};

export const approvedFounder = process.env.NEXT_PUBLIC_FOUNDER_APPROVED === "true"
  && founder.name && founder.role && founder.bio
  ? founder as Required<Pick<typeof founder, "name" | "role" | "bio">> & Pick<typeof founder, "imageUrl" | "profileUrl">
  : null;
