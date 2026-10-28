/**
 * A heading's text, set letter by letter so it can rise in as it scrolls
 * into view (`.cdl-kinetic-*` in app/globals.css; the heading itself carries
 * `.cdl-kinetic`, which names the scroll timeline the letters follow).
 *
 * Assistive tech and search engines read the plain text in the `sr-only`
 * copy; the letters are `aria-hidden`, so nothing is spelled out. Each word
 * is one unbreakable box, so wrapping and `text-wrap: balance` behave exactly
 * as with plain text. The stagger is capped, so a long title still finishes
 * early in its scroll range.
 *
 * Server component: no JavaScript ships for it.
 */
const MAX_STAGGER = 30;

export function KineticText({ text }: { text: string }) {
  let index = 0;
  const parts = text.split(/(\s+)/);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {parts.map((part, word) =>
          /^\s+$/.test(part) ? (
            ' '
          ) : part ? (
            <span key={word} className="cdl-kinetic-word">
              {Array.from(part).map((char, position) => (
                <span
                  key={position}
                  className="cdl-kinetic-char"
                  style={{ '--k': Math.min(index++, MAX_STAGGER) } as React.CSSProperties}
                >
                  {char}
                </span>
              ))}
            </span>
          ) : null,
        )}
      </span>
    </>
  );
}
