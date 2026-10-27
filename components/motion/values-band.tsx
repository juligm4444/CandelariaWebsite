import Image from 'next/image';

/**
 * The four values of the semillero as a single continuous band. One marquee on
 * the whole site, placed here because the values are breadth with no item
 * deserving individual attention. The isotipo separates terms instead of a
 * middle dot.
 *
 * Under `prefers-reduced-motion` the band is replaced by a static, wrapping
 * list. Both versions are in the markup and CSS picks one, so the choice
 * needs no script and the server and client always render the same HTML.
 */
export function ValuesBand({ items, label }: { items: string[]; label: string }) {
  return (
    <>
      <ul
        aria-label={label}
        className="hidden flex-wrap items-center justify-center gap-x-5 gap-y-3 motion-reduce:flex"
      >
        {items.map((item) => (
          <li key={item} className="font-titulo text-2xl font-bold text-ink md:text-[2rem]">
            {item}
          </li>
        ))}
      </ul>

      <div
        aria-label={label}
        role="group"
        className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:hidden"
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 animate-[cdl-marquee_36s_linear_infinite] items-center"
          >
            {items.map((item) => (
              <li key={item} className="flex items-center gap-5 pr-5">
                <span className="font-titulo text-[2rem] font-bold whitespace-nowrap text-ink md:text-[3rem]">
                  {item}
                </span>
                <Image
                  src="/brand/isotipo-institucional.webp"
                  width={32}
                  height={32}
                  alt=""
                  aria-hidden
                  sizes="32px"
                  className="size-8 opacity-80"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </>
  );
}
