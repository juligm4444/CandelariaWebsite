/**
 * Social links on a member's public card.
 *
 * Every URL is normalised and checked here before it is stored or rendered:
 * https only, no credentials, and the platform links must point at the
 * platform's own host. A link that fails returns null, which the profile
 * action reports as an error instead of storing it.
 */

export type SocialKey = 'linkedinUrl' | 'githubUrl' | 'instagramUrl' | 'websiteUrl';

export const SOCIAL_KEYS: SocialKey[] = ['linkedinUrl', 'githubUrl', 'instagramUrl', 'websiteUrl'];

const HOSTS: Record<Exclude<SocialKey, 'websiteUrl'>, string[]> = {
  linkedinUrl: ['linkedin.com'],
  githubUrl: ['github.com'],
  instagramUrl: ['instagram.com'],
};

function hostMatches(host: string, allowed: string[]): boolean {
  return allowed.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

/** Returns the cleaned URL, or null when it is not acceptable for `key`. */
export function normaliseSocialUrl(key: SocialKey, raw: string): string | null {
  const value = raw.trim();
  if (!value || value.length > 300) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;

  const host = url.hostname.toLowerCase();
  if (key !== 'websiteUrl' && !hostMatches(host, HOSTS[key])) return null;

  url.hash = '';
  return url.toString();
}
