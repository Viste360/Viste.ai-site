"use client";

import type { ReactNode } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

export function TrackedLink({
  href,
  event,
  properties,
  className,
  children,
  target,
  rel,
}: {
  href: string;
  event: AnalyticsEvent;
  properties?: Record<string, string | number | boolean>;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
}) {
  return <a href={href} className={className} target={target} rel={rel} onClick={() => trackEvent(event, properties)}>{children}</a>;
}
