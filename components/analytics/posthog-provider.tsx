'use client';

import { usePathname } from 'next/navigation';
import { PostHogProvider as Provider, usePostHog } from 'posthog-js/react';
import { Suspense, useEffect, type ReactNode } from 'react';

/**
 * PostHog analytics.
 *
 * Privacy posture, deliberate and conservative:
 *  - session recording off, so no screen of a signed-in profile is stored.
 *  - autocapture off, so no form field value ever leaves the browser.
 *  - `person_profiles: 'identified_only'`, so an anonymous visitor gets no
 *    stored profile.
 *  - Do Not Track respected.
 *  - page views captured manually with the pathname only. Query strings on
 *    this site carry password-reset tokens, and those must never reach an
 *    analytics vendor.
 *
 * With no `NEXT_PUBLIC_POSTHOG_KEY` the tree renders untouched and no network
 * request is made. The project key is public by design: it can write events,
 * never read them.
 */
const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

function PageViewTracker() {
  const posthog = usePostHog();
  const pathname = usePathname();

  useEffect(() => {
    if (!posthog) return;
    posthog.capture('$pageview', { $pathname: pathname });
  }, [posthog, pathname]);

  return null;
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  if (!apiKey) return <>{children}</>;

  return (
    <Provider
      apiKey={apiKey}
      options={{
        api_host: apiHost,
        defaults: '2025-05-24',
        person_profiles: 'identified_only',
        capture_pageview: false,
        capture_pageleave: true,
        autocapture: false,
        disable_session_recording: true,
        respect_dnt: true,
        sanitize_properties: (properties) => {
          const safe: Record<string, unknown> = { ...properties };
          for (const field of ['$current_url', '$referrer', '$initial_current_url']) {
            const value = safe[field];
            if (typeof value !== 'string') continue;
            try {
              const url = new URL(value);
              safe[field] = `${url.origin}${url.pathname}`;
            } catch {
              delete safe[field];
            }
          }
          return safe;
        },
      }}
    >
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </Provider>
  );
}
