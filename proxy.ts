import { NextResponse, type NextRequest } from 'next/server';

/**
 * Per-request Content Security Policy.
 *
 * A fresh nonce is minted for every response and handed to the layout through
 * the `x-nonce` request header, so `script-src` never needs `unsafe-inline`.
 * `strict-dynamic` lets a nonced script load its own chunks, which is what
 * keeps Next.js hydration working under a strict policy.
 *
 * `style-src` keeps `unsafe-inline`: React writes inline `style` attributes for
 * the brand marks' protection area and for the area accent bars, and there is
 * no nonce mechanism for style attributes. Inline styles alone do not execute.
 */
function connectSources(): string[] {
  // `blob:` is needed for the embedded textures of the 3D area logos, which
  // three.js reads from object URLs created by this same page.
  const sources = new Set<string>(["'self'", 'blob:']);

  const posthog = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (posthog) {
    sources.add(posthog);
    sources.add('https://us-assets.i.posthog.com');
    sources.add('https://us.i.posthog.com');
  }

  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabase) sources.add(supabase);

  return [...sources];
}

function imageSources(): string[] {
  const sources = new Set<string>(["'self'", 'data:', 'blob:']);
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabase) sources.add(supabase);
  return [...sources];
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const policy = [
    `default-src 'self'`,
    // `unsafe-eval` is development only: the React development build uses
    // eval() to reconstruct stack traces. The production policy never has it.
    // `wasm-unsafe-eval` allows compiling WebAssembly and nothing else (no
    // eval, no Function): the Draco decoder of the 3D area logos is WASM, and
    // without it the logos never load in production.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval' https:${
      process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"
    }`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src ${imageSources().join(' ')}`,
    `font-src 'self'`,
    `connect-src ${connectSources().join(' ')}`,
    // The hosted checkout is a top-level redirect, never an iframe.
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('content-security-policy', policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('content-security-policy', policy);

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and the image optimiser, which are
     * served straight from the CDN and carry no inline script.
     */
    // Static files under public/ need no CSP header and must not cost a
    // proxy invocation each: the hero alone is ~100 frame requests.
    '/((?!_next/static|_next/image|favicon.ico|fonts/|brand/|img/|hero/|models/|draco/|robots.txt|sitemap.xml).*)',
  ],
};
