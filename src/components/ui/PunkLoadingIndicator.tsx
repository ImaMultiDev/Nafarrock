const PUNK_SVG_FILTER =
  "brightness(0) saturate(100%) invert(36%) sepia(100%) saturate(5000%) hue-rotate(310deg)";

/** Dimensiones unificadas para carga full (página y listas) */
const FULL_LOADING_CLASSES = {
  wrapper: "flex min-h-[45vh] flex-col items-center justify-center gap-8",
  icon: "h-20 w-20 object-contain",
  text: "font-display text-xl tracking-[0.2em] sm:text-2xl sm:tracking-[0.3em]",
} as const;

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
    <div className={FULL_LOADING_CLASSES.wrapper}>
      <div className="animate-loading-punk-float" aria-hidden>
        <img
          src="/svg/punk-svgrepo-com.svg"
          alt=""
          width={80}
          height={80}
          className={FULL_LOADING_CLASSES.icon}
          style={{ filter: PUNK_SVG_FILTER }}
        />
      </div>
      <div className="neon-mapa-sign">
        <span className={`neon-mapa-text ${FULL_LOADING_CLASSES.text}`}>
          {labelUpper}
        </span>
      </div>
    </div>
  );
}
