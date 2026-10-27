'use client';

import { IconSearch, IconSortAscending, IconSortDescending, IconX } from '@tabler/icons-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type MouseEvent,
  type ReactNode,
} from 'react';

import type { AreaKey } from '@/content/areas';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

/**
 * The log's filter console, and the results it filters.
 *
 * One panel holds every control: a search field (focus it with "/"), the
 * area selector with live counts and a gold capsule that slides to the active
 * option, a timeline of years, and a two-way order switch. Every option shows
 * how many results it would give, counted with the other filters applied.
 *
 * Progressive enhancement: every option is a real link and the search is a
 * real GET form, so all of it works without JavaScript. With JavaScript,
 * navigation happens in a transition with `router.replace`: the page does not
 * reload or jump, the results dim while the server renders the new list, and
 * a line of light runs along the panel. Typing searches after a short pause.
 */

export type LogState = {
  area: AreaKey | null;
  year: number | null;
  order: 'newest' | 'oldest';
  q: string;
};

export type LogArea = { key: AreaKey; name: string; accent: string; rgb: string; count: number };

export type LogLabels = {
  searchLabel: string;
  searchPlaceholder: string;
  searchShortcut: string;
  clearSearch: string;
  area: string;
  allAreas: string;
  year: string;
  allYears: string;
  order: string;
  newest: string;
  oldest: string;
  clear: string;
  summary: string;
  updating: string;
};

type Patch = Partial<{ area: AreaKey | null; year: number | null; order: LogState['order']; q: string }>;

function hrefFor(state: LogState, patch: Patch): string {
  const next = { ...state, ...patch };
  const params = new URLSearchParams();
  if (next.area) params.set('area', next.area);
  if (next.year) params.set('year', String(next.year));
  if (next.order === 'oldest') params.set('order', 'oldest');
  if (next.q.trim()) params.set('q', next.q.trim());
  const query = params.toString();
  return query ? `/publications?${query}` : '/publications';
}

/** Lets modified clicks (new tab, new window) through untouched. */
function plainClick(event: MouseEvent) {
  return !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0);
}

export function LogExplorer({
  state,
  areas,
  total,
  years,
  labels,
  children,
}: {
  state: LogState;
  areas: LogArea[];
  total: number;
  years: { year: number; count: number }[];
  labels: LogLabels;
  children: ReactNode;
}) {
  const router = useRouter();
  const reduce = usePrefersReducedMotion();
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // The field keeps its own text while typing; it follows the URL when the
  // URL changes for another reason (back button, a cleared filter).
  const [query, setQuery] = useState(state.q);
  const [shownQuery, setShownQuery] = useState(state.q);
  if (state.q !== shownQuery) {
    setShownQuery(state.q);
    setQuery(state.q);
  }

  const go = (patch: Patch) => {
    startTransition(() => router.replace(hrefFor(state, patch), { scroll: false }));
  };

  const linkProps = (patch: Patch) => ({
    href: hrefFor(state, patch),
    scroll: false,
    onClick: (event: MouseEvent) => {
      if (!plainClick(event)) return;
      event.preventDefault();
      go(patch);
    },
  });

  // Search after a pause in typing.
  useEffect(() => {
    if (query.trim() === state.q.trim()) return;
    const timer = window.setTimeout(() => go({ q: query }), 320);
    return () => window.clearTimeout(timer);
    // `go` is rebuilt every render; the timer only needs the latest query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, state.q]);

  // "/" focuses the search, as in most documentation sites.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, duration: 0.45, bounce: 0.12 };
  const filtered = Boolean(state.area || state.year || state.q);
  const yearOptions: { year: number | null; label: string; count: number }[] = [
    { year: null, label: labels.allYears, count: years.reduce((sum, y) => sum + y.count, 0) },
    ...years.map((y) => ({ year: y.year, label: String(y.year), count: y.count })),
  ];

  return (
    <div className="flex flex-col gap-7">
      <div
        className="relative overflow-hidden rounded-block border border-hairline bg-surface/85 backdrop-blur-md lg:sticky lg:top-[5.5rem] lg:z-30"
        aria-busy={pending}
      >
        {/* Search and order. */}
        <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:p-4">
          <form
            action="/publications"
            method="get"
            role="search"
            className="flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              go({ q: query });
            }}
          >
            {state.area ? <input type="hidden" name="area" value={state.area} /> : null}
            {state.year ? <input type="hidden" name="year" value={state.year} /> : null}
            {state.order === 'oldest' ? <input type="hidden" name="order" value="oldest" /> : null}
            <label className="sr-only" htmlFor="log-search">
              {labels.searchLabel}
            </label>
            <div
              data-light=""
              className="cdl-light group flex min-h-14 items-center gap-2 rounded-pill border border-hairline-strong bg-canvas px-3 transition-colors duration-200 focus-within:border-dorado-100 [--cdl-light-alpha:0.1]"
            >
              <IconSearch className="icon-brand size-5 shrink-0 text-ink-faint group-focus-within:text-dorado-100" aria-hidden />
              <input
                ref={inputRef}
                id="log-search"
                type="search"
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape' && query) {
                    event.preventDefault();
                    setQuery('');
                  }
                }}
                maxLength={120}
                placeholder={labels.searchPlaceholder}
                autoComplete="off"
                className="min-w-0 flex-1 self-stretch bg-transparent text-base text-ink placeholder:text-ink-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  aria-label={labels.clearSearch}
                  className="cdl-glow inline-flex size-12 items-center justify-center rounded-pill text-ink-muted hover:text-ink"
                >
                  <IconX className="icon-brand size-5" aria-hidden />
                </button>
              ) : (
                <kbd
                  aria-hidden
                  title={labels.searchShortcut}
                  className="hidden min-w-8 items-center justify-center rounded-pill border border-hairline-strong px-2 font-texto text-base text-ink-faint sm:inline-flex"
                >
                  /
                </kbd>
              )}
            </div>
          </form>

          <div role="group" aria-label={labels.order} className="flex shrink-0 rounded-pill border border-hairline-strong p-1">
            {(['newest', 'oldest'] as const).map((value) => {
              const active = state.order === value;
              const Icon = value === 'newest' ? IconSortDescending : IconSortAscending;
              return (
                <Link
                  key={value}
                  {...linkProps({ order: value })}
                  aria-current={active ? 'true' : undefined}
                  data-ripple=""
                  className={cn(
                    'cdl-press relative isolate inline-flex min-h-12 flex-1 items-center justify-center gap-1 rounded-pill px-2 text-base whitespace-nowrap sm:gap-2 sm:px-3',
                    active ? 'text-morado-300' : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="log-order"
                      aria-hidden
                      className="absolute inset-0 -z-10 rounded-pill bg-dorado-100"
                      transition={spring}
                    />
                  ) : null}
                  <Icon className="icon-brand hidden size-5 sm:block" aria-hidden />
                  {value === 'newest' ? labels.newest : labels.oldest}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Areas. */}
        <div className="border-t border-hairline px-3 py-3 md:px-4">
          <p className="mb-2 text-base font-medium uppercase text-accent">{labels.area}</p>
          <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible">
            {[{ key: null, name: labels.allAreas, accent: 'var(--color-dorado-100)', rgb: '255 185 56', count: total }, ...areas].map(
              (option) => {
                const active = state.area === option.key;
                return (
                  <li key={option.key ?? 'all'} className="shrink-0">
                    <Link
                      {...linkProps({ area: option.key })}
                      aria-current={active ? 'true' : undefined}
                      data-light=""
                      data-ripple=""
                      className={cn(
                        'cdl-press cdl-light relative isolate inline-flex min-h-12 items-center gap-2 rounded-pill border px-3 text-base',
                        active ? 'border-transparent text-morado-300' : 'border-hairline text-ink-muted hover:text-ink',
                      )}
                      style={{ '--cdl-light-rgb': option.rgb, '--cdl-light-alpha': '0.22' } as React.CSSProperties}
                    >
                      {active ? (
                        <motion.span
                          layoutId="log-area"
                          aria-hidden
                          className="absolute inset-0 -z-10 rounded-pill bg-dorado-100"
                          transition={spring}
                        />
                      ) : null}
                      {option.key ? (
                        <span
                          aria-hidden
                          className="size-3 shrink-0 rounded-full border-2"
                          style={{ borderColor: active ? 'var(--color-morado-300)' : option.accent }}
                        />
                      ) : null}
                      <span>{option.name}</span>
                      <span className={cn('tabular-nums', active ? 'text-morado-300/72' : 'text-ink-faint')}>
                        {option.count}
                      </span>
                    </Link>
                  </li>
                );
              },
            )}
          </ul>
        </div>

        {/* Years, as a timeline. */}
        {years.length > 0 ? (
          <div className="border-t border-hairline px-3 py-3 md:px-4">
            <p className="mb-1 text-base font-medium uppercase text-accent">{labels.year}</p>
            <ol className="relative flex overflow-x-auto [scrollbar-width:none]">
              <span aria-hidden className="absolute inset-x-6 top-5 h-px bg-hairline-strong" />
              {yearOptions.map((option) => {
                const active = state.year === option.year;
                return (
                  <li key={option.year ?? 'all'} className="relative shrink-0">
                    <Link
                      {...linkProps({ year: option.year })}
                      aria-current={active ? 'true' : undefined}
                      data-light=""
                      className="cdl-light group flex min-w-24 flex-col items-center gap-1 rounded-card px-4 pb-2 pt-3 [--cdl-light-alpha:0.12]"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'relative size-4 rounded-full border-2 transition-[background-color,border-color,scale] duration-300 ease-out-ui',
                          active
                            ? 'scale-110 border-dorado-100 bg-dorado-100'
                            : 'border-hairline-strong bg-surface group-hover:border-dorado-100',
                        )}
                      >
                        {active ? (
                          <span className="absolute -inset-3 -z-10 rounded-full bg-[radial-gradient(circle,rgb(255_185_56/0.45),transparent_70%)]" />
                        ) : null}
                      </span>
                      <span className={cn('text-base tabular-nums', active ? 'font-medium text-ink' : 'text-ink-muted')}>
                        {option.label}
                      </span>
                      <span className="text-base text-ink-faint tabular-nums">{option.count}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}

        {/* Summary and reset. */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-3 py-2 md:px-4">
          <p className="text-base text-ink-muted" aria-live="polite">
            {pending ? labels.updating : labels.summary}
          </p>
          {filtered ? (
            <Link
              {...linkProps({ area: null, year: null, q: '' })}
              data-light=""
              className="cdl-link inline-flex min-h-12 items-center gap-2 text-base font-medium text-accent"
            >
              <IconX className="icon-brand size-5" aria-hidden />
              <span>{labels.clear}</span>
            </Link>
          ) : null}
        </div>

        {/* Line of light while the server renders the new list. */}
        <div aria-hidden className={cn('cdl-scan absolute inset-x-0 bottom-0 h-0.5', pending ? 'opacity-100' : 'opacity-0')} />
      </div>

      <div
        data-pending={pending ? '' : undefined}
        className="transition-[opacity,filter] duration-300 data-[pending]:opacity-50 data-[pending]:blur-[2px]"
      >
        {children}
      </div>
    </div>
  );
}
