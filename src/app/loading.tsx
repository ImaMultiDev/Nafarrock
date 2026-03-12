const PUNK_SVG_FILTER =
  "brightness(0) saturate(100%) invert(36%) sepia(100%) saturate(5000%) hue-rotate(310deg)";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
      <div className="animate-loading-punk-float" aria-hidden>
        <img
          src="/svg/punk-svgrepo-com.svg"
          alt=""
          width={80}
          height={80}
          className="h-20 w-20 object-contain"
          style={{ filter: PUNK_SVG_FILTER }}
        />
      </div>
      <div className="neon-mapa-sign">
        <span className="neon-mapa-text font-display text-xl tracking-[0.2em] sm:text-2xl sm:tracking-[0.3em]">
          CARGANDO
        </span>
      </div>
    </div>
  );
}
