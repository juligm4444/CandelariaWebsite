import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/content/site';

/**
 * Account surfaces and anything that can carry a token stay out of every
 * index. Everything public is open to search engines AND to AI crawlers: the
 * project wants to be found and cited, so the AI agents are listed by name
 * with the same rules instead of being left to the wildcard (some hosts and
 * templates block them by default). /llms.txt maps the site for them.
 */
const PRIVATE = [
  '/api/',
  '/dashboard',
  '/profile',
  '/purchases',
  '/login',
  '/register',
  '/reset-password',
  '/forgot-password',
  '/verify-email',
];

const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
  'Bytespider',
  'Amazonbot',
  'DuckAssistBot',
  'cohere-ai',
  'MistralAI-User',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: AI_AGENTS, allow: ['/', '/llms.txt'], disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
