<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Candelaria Solar Car

Next.js 16 + TypeScript + Tailwind 4. Supabase (Postgres), better-auth, Polar.sh,
Resend, PostHog, Vercel. No separate backend.

Read before changing anything visual: `docs/brand/candelaria-marca.md` is the
brand manual and is binding, and `docs/DESIGN.md` explains how it was applied.

## Rules that are easy to break by accident

- **One theme.** No light/dark switch, no `prefers-color-scheme`, no
  `data-theme`. Two surface families, `:root` (deep purple) and `.on-paper`
  (Neutro 100), driven by the same semantic variables.
- **Type sizes are multiples of 8, with 16px as the floor.** No 14px, no 12px.
  Letter-spacing stays at 0 everywhere, including labels.
- **No shadows.** Depth comes from background contrast. The one exception is
  `.halo-brand`.
- **Area colours**: `area.accent` paints bars and borders, `area.label` paints
  text. They are different values on purpose, and `label` is contrast-checked
  for both surface families.
- **All copy lives in `content/es.ts` and `content/en.ts`.** English is typed
  against Spanish, so a missing key is a compile error.
- **Never invent a technical figure.** The vehicle page publishes a validation
  state, not a measurement, until the owning area closes it.

## Security invariants

- Every module that touches a secret imports `server-only`.
- Prices are never sent from the browser. `/api/checkout` re-derives every
  amount from `content/catalog.ts`.
- Every Server Action re-reads the session and re-checks authorisation. Hiding
  a button is not an access control.
- All SQL is parameterised. No user input is interpolated into a query.
- **Internal membership is invite-only, never domain-only.** An
  `@uniandes.edu.co` address alone never grants `isInternal` at sign-up (see
  `lib/auth/server.ts` `databaseHooks.user.create.before`): it only makes an
  address *eligible to be invited* (`isInternalEmail`, checked in
  `inviteMemberAction`). If you ever find yourself tempted to auto-grant
  internal status from an e-mail domain again, don't — that was a real
  regression from the previous system and the user corrected it on purpose.
- A lead can only revoke, promote to co-lead, or transfer leadership within
  their own area (`canManageArea` / `isAreaLeader` in `lib/auth/session.ts`).
  There is no cross-area override and no second approval step (e.g. from
  Comité) on these actions as of 2026-10-03 — ask before adding one, and
  ask before removing the per-area scoping.
- Before shipping: `npm run typecheck && npm run lint && npm run build`.
  See `docs/SECURITY.md` for the scanner commands.
