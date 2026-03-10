"use client";

const PINK = "#ff006e";
const GREEN = "#00C853";
const SIZE = 32;
const HEIGHT = 40;

/** SVG de púa de guitarra (punta abajo) */
function GuitarPickSvg({ color }: { color: string }) {
  const anchorX = SIZE / 2;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={SIZE}
      height={HEIGHT}
      viewBox={`0 0 ${SIZE} ${HEIGHT}`}
    >
      <path
        d={`M${anchorX} 4 C${SIZE - 4} 4 ${SIZE} 12 ${SIZE} 24 Q${SIZE} 36 ${anchorX} ${HEIGHT} Q2 36 2 24 C2 12 8 4 ${anchorX} 4`}
        fill={color}
        stroke="rgba(0,0,0,0.4)"
        strokeWidth={1}
      />
    </svg>
  );
}

export function GuitarPickMarkerVenue() {
  return <GuitarPickSvg color={PINK} />;
}

export function GuitarPickMarkerFestival() {
  return <GuitarPickSvg color={GREEN} />;
}
