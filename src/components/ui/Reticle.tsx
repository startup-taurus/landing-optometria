/**
 * Retícula óptica decorativa: anillos concéntricos + cruz + marcas.
 * Motivo de marca (lente/enfoque). Puramente ornamental (aria-hidden).
 * El SVG gira lento vía la clase `.reticle-spin` (globals.css), que respeta
 * prefers-reduced-motion. El `className` exterior controla posición/tamaño/color.
 */
export default function Reticle({ className = "" }: { className?: string }) {
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <div className={className}>
      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        focusable="false"
        className="reticle-spin h-full w-full"
      >
        <g fill="none" stroke="currentColor" strokeWidth="0.5">
          <circle cx="100" cy="100" r="96" />
          <circle cx="100" cy="100" r="72" strokeDasharray="2 4" />
          <circle cx="100" cy="100" r="46" />
          <circle cx="100" cy="100" r="22" strokeWidth="0.75" />
          {/* Cruz central */}
          <line x1="100" y1="6" x2="100" y2="40" />
          <line x1="100" y1="160" x2="100" y2="194" />
          <line x1="6" y1="100" x2="40" y2="100" />
          <line x1="160" y1="100" x2="194" y2="100" />
          {/* Marcas perimetrales */}
          {ticks.map((deg) => (
            <line
              key={deg}
              x1="100"
              y1="4"
              x2="100"
              y2={deg % 45 === 0 ? 14 : 9}
              transform={`rotate(${deg} 100 100)`}
            />
          ))}
        </g>
        <circle cx="100" cy="100" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}
