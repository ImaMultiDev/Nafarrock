const PUNK_SVG_FILTER =
  "brightness(0) saturate(100%) invert(36%) sepia(100%) saturate(5000%) hue-rotate(310deg)";

export function AuthPunkIcon() {
  return (
    <div className="animate-loading-punk-float shrink-0" aria-hidden>
      <img
        src="/svg/punk-svgrepo-com.svg"
        alt=""
        width={56}
        height={56}
        className="h-12 w-12 object-contain sm:h-14 sm:w-14"
        style={{ filter: PUNK_SVG_FILTER }}
      />
    </div>
  );
}
