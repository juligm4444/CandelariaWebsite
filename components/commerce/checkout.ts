'use client';

/**
 * Single entry point to the checkout endpoint.
 *
 * The browser sends intent only; the server re-derives the price from
 * `content/catalog.ts`.
 */
export type CheckoutIntent = { kind: 'membership'; tierId: 'cobre' | 'aluminio' | 'titanio' };

export type CheckoutError =
  | 'PAYMENTS_DISABLED'
  | 'AUTH_REQUIRED'
  | 'RATE_LIMITED'
  | 'BAD_REQUEST'
  | 'FAILED';

export async function startCheckout(intent: CheckoutIntent): Promise<CheckoutError | never> {
  let response: Response;

  try {
    response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intent),
    });
  } catch {
    return 'FAILED';
  }

  if (response.ok) {
    const data: unknown = await response.json().catch(() => null);
    const url = data && typeof data === 'object' && 'url' in data ? (data as { url: unknown }).url : null;

    if (typeof url === 'string' && /^https:\/\//.test(url)) {
      // Top-level navigation to the hosted checkout. Never an iframe: the CSP
      // blocks framing and the payment page must own the address bar.
      window.location.assign(url);
      return new Promise<never>(() => {});
    }
    return 'FAILED';
  }

  if (response.status === 401) return 'AUTH_REQUIRED';
  if (response.status === 429) return 'RATE_LIMITED';
  if (response.status === 503) return 'PAYMENTS_DISABLED';
  if (response.status === 400) return 'BAD_REQUEST';
  return 'FAILED';
}
