const PUNK_SVG_FILTER =
  "brightness(0) saturate(100%) invert(36%) sepia(100%) saturate(5000%) hue-rotate(310deg)";

type Props = {
  label: string;
  variant?: "full" | "inline";
};

export function PunkLoadingIndicator({ label, variant = "full" }: Props) {
  const labelUpper = label.toUpperCase();

  if (variant === "inline") {
    return (
      <span className="flex items-center justify-center gap-2">
        <span className="animate-loading-punk-float inline-block" aria-hidden>
          <img
            src="/svg/punk-svgrepo-com.svg"
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
            style={{ filter: PUNK_SVG_FILTER }}
          />
        </span>
        <span>{labelUpper}</span>
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <div className="animate-loading-punk-float" aria-hidden>
        <img
          src="/svg/punk-svgrepo-com.svg"
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 object-contain"
          style={{ filter: PUNK_SVG_FILTER }}
        />
      </div>
      <div className="neon-mapa-sign">
        <span className="neon-mapa-text font-display text-lg tracking-[0.15em] sm:text-xl sm:tracking-[0.2em]">
          {labelUpper}
        </span>
      </div>
    </div>
  );
}
