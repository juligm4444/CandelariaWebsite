/**
 * Hero drawing for /support: the sun feeding the three things a contribution
 * pays for, with light running down each line toward its destination. The
 * numbers are the same provisional split as the chart below, and carry its
 * asterisk. Decorative: the chart's legend is the accessible version.
 *
 * Pure SVG; the flowing dashes and the sun's rays move only without a
 * reduced-motion preference (`.cdl-flow`, `.cdl-spin` in globals.css).
 */

type Destination = { title: string; share: number; color: string };

const NODES = [
  { x: 92, y: 312 },
  { x: 240, y: 344 },
  { x: 388, y: 312 },
];

const SUN = { x: 240, y: 84 };

const VIEW = { width: 480, height: 450 };

export function EnergyFlow({ destinations, mark }: { destinations: Destination[]; mark: string }) {
  return (
    <div aria-hidden className="relative w-full max-w-[34rem]">
    <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className="h-auto w-full" fill="none">
      <defs>
        <radialGradient id="flow-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="var(--color-dorado-100)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--color-dorado-100)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sun, with a slow ring of rays. */}
      <circle cx={SUN.x} cy={SUN.y} r="76" fill="url(#flow-sun)" />
      <g className="cdl-spin cdl-spin-slow" style={{ transformOrigin: `${SUN.x}px ${SUN.y}px`, transformBox: 'view-box' }}>
        {Array.from({ length: 12 }, (_, index) => {
          const angle = (Math.PI / 6) * index;
          const x1 = SUN.x + Math.cos(angle) * 38;
          const y1 = SUN.y + Math.sin(angle) * 38;
          const x2 = SUN.x + Math.cos(angle) * 50;
          const y2 = SUN.y + Math.sin(angle) * 50;
          return (
            <line
              key={index}
              x1={x1.toFixed(1)}
              y1={y1.toFixed(1)}
              x2={x2.toFixed(1)}
              y2={y2.toFixed(1)}
              stroke="var(--color-dorado-100)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <circle cx={SUN.x} cy={SUN.y} r="26" fill="var(--color-dorado-100)" />

      {destinations.map((destination, index) => {
        const node = NODES[index];
        if (!node) return null;
        const path = `M${SUN.x} ${SUN.y + 30} C ${SUN.x} ${SUN.y + 140}, ${node.x} ${node.y - 150}, ${node.x} ${node.y - 40}`;
        return (
          <g key={destination.title}>
            <path d={path} stroke="var(--cdl-border)" strokeWidth="2" />
            <path
              d={path}
              stroke={destination.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 14"
              className="cdl-flow"
              style={{ animationDuration: `${1.2 + index * 0.25}s` }}
            />
            <circle cx={node.x} cy={node.y} r="40" fill="var(--color-morado-200)" stroke={destination.color} strokeWidth="2" />
          </g>
        );
      })}
    </svg>
      {/* Figures and names are HTML over the drawing, not SVG text: SVG text
          shrinks with the drawing and would fall under the 16px floor on a
          phone. */}
      {destinations.map((destination, index) => {
        const node = NODES[index];
        if (!node) return null;
        return (
          <div key={destination.title}>
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 font-titulo text-base font-bold text-neutro-100 tabular-nums sm:text-2xl"
              style={{ left: `${(node.x / VIEW.width) * 100}%`, top: `${(node.y / VIEW.height) * 100}%` }}
            >
              {destination.share}%{mark}
            </span>
            <span
              className="absolute -translate-x-1/2 whitespace-nowrap text-base text-ink-muted"
              style={{ left: `${(node.x / VIEW.width) * 100}%`, top: `${((node.y + 48) / VIEW.height) * 100}%` }}
            >
              {destination.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
