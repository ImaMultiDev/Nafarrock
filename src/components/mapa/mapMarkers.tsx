"use client";

import { useId } from "react";

const SIZE = 40;

/** Colores Nafarrock para marcadores */
const COLORS = {
  PUNK_PINK: "#ff006e",
  PUNK_GREEN: "#00C853",
  PUNK_RED: "#E60026",
  PUNK_YELLOW: "#ffd60a",
  /** Marcador genérico (sin categoría) */
  PUNK_WHITE: "#e8e8e8",
} as const;

/** Filtro neón reutilizable */
function NeonGlowFilter({ id, color }: { id: string; color: string }) {
  return (
    <filter
      id={id}
      x="-50%"
      y="-50%"
      width="200%"
      height="200%"
      colorInterpolationFilters="sRGB"
    >
      <feGaussianBlur stdDeviation="1.2" result="blur" />
      <feFlood floodColor={color} floodOpacity="0.85" result="color" />
      <feComposite in="color" in2="blur" operator="in" result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

/** Paths: pub-bar-drink-beer-alcohol-svgrepo-com.svg (TABERNA_BAR) */
const PUB_BAR_PATHS = [
  "M8.7,27.3c0.7,1,1.9,1.7,3.3,1.7h5h3c2.2,0,4-1.8,4-4V14",
  "M26.5,25L26.5,25c-1.4,0-2.5-1.1-2.5-2.5v-5c0-1.4,1.1-2.5,2.5-2.5h0c1.4,0,2.5,1.1,2.5,2.5v5 C29,23.9,27.9,25,26.5,25z",
  "M13 19L13 25",
  "M19 19L19 25",
  "M23.8,6.5c-1.2-0.7-2.2-0.6-3.2-0.3c0,0,0,0,0,0c-0.3-0.3-0.6-0.6-0.9-0.9c0,0,0,0-0.1,0 c-0.1-0.1-0.3-0.2-0.5-0.3c0,0-0.1-0.1-0.1-0.1c-0.1-0.1-0.3-0.2-0.4-0.2c-0.1,0-0.1-0.1-0.2-0.1c-0.1-0.1-0.3-0.1-0.4-0.2 c-0.1,0-0.1-0.1-0.2-0.1c-0.1,0-0.3-0.1-0.4-0.1c-0.1,0-0.1,0-0.2-0.1c-0.1,0-0.3-0.1-0.4-0.1c-0.1,0-0.1,0-0.2,0 c-0.2,0-0.4,0-0.7,0c-0.3,0-0.5,0-0.7,0.1c-0.1,0-0.1,0-0.2,0c-0.2,0-0.4,0.1-0.5,0.1c-0.1,0-0.1,0-0.2,0c-0.5,0.1-0.9,0.3-1.3,0.6 c0,0,0,0-0.1,0l0,0c-0.8,0.5-1.5,1.1-2,1.9c-0.9-0.6-2-0.9-3.2-0.7C5.9,6.4,4.3,7.9,4.1,9.8c-0.3,1.8,0.6,3.5,1.9,4.4v4.5 c0,1.9-0.7,3.8-2.1,5.1c-0.8,0.7-1.2,1.9-0.8,3.1c0.4,1.3,1.6,2,3,2h0.1C7.7,29,9,27.7,9,26.2V16.1c0-0.6,0.4-1.2,1-1.4c0,0,0,0,0,0 c0.9-0.3,1.8-0.2,2.6,0.3c0.2,0.2,0.5,0.3,0.7,0.4c0,0,0.1,0,0.1,0.1c0.5,0.2,1,0.4,1.5,0.5c0.1,0,0.1,0,0.2,0 c0.3,0,0.5,0.1,0.8,0.1c0.2,0,0.4,0,0.7,0c0.1,0,0.1,0,0.2,0c0.1,0,0.3,0,0.4-0.1c0.1,0,0.1,0,0.2-0.1c0.1,0,0.3-0.1,0.4-0.1 c0.1,0,0.1-0.1,0.2-0.1c0.1-0.1,0.3-0.1,0.4-0.2c0.1,0,0.1-0.1,0.2-0.1c0.1-0.1,0.3-0.1,0.4-0.2c0,0,0.1-0.1,0.1-0.1 c0.2-0.1,0.3-0.2,0.5-0.3c0,0,0,0,0.1,0c0.3-0.3,0.6-0.6,0.9-0.9c0,0,0,0,0,0c0.4,0.1,0.9,0.2,1.3,0.2c2.3,0,4.1-1.9,4-4.2 C25.9,8.4,25,7.2,23.8,6.5z",
];

/** Path: guitar-pick-svgrepo-com.svg (SALA_CONCIERTOS) */
const GUITAR_PICK_PATH =
  "M18.448,26.655c0.001,-0.001 0.001,-0.001 0.001,-0.002c2.407,-3.406 6.792,-9.888 8.717,-14.401c0.535,-1.252 0.882,-2.367 0.983,-3.246c0.088,-0.778 -0.016,-1.414 -0.263,-1.881c-0.359,-0.676 -1.158,-1.309 -2.339,-1.783c-2.201,-0.881 -5.872,-1.342 -9.545,-1.342c-3.673,-0 -7.344,0.461 -9.545,1.342c-1.181,0.474 -1.98,1.107 -2.338,1.783c-0.248,0.467 -0.352,1.103 -0.263,1.881c0.1,0.879 0.447,1.994 0.982,3.246c1.925,4.513 6.31,10.995 8.716,14.402c0.001,0 0.001,0.001 0.001,0.002c0.563,0.792 1.475,1.263 2.447,1.263c0.972,-0 1.884,-0.471 2.446,-1.264Zm-2.455,-17.699l-0.001,0.055l-0,4.601c-0.236,-0.066 -0.485,-0.101 -0.742,-0.101c-1.518,-0 -2.75,1.232 -2.75,2.75c-0,1.517 1.232,2.75 2.75,2.75c1.518,-0 2.75,-1.233 2.75,-2.75c-0,-0.073 -0.008,-4.835 -0.008,-4.835l1.301,1.301c0.39,0.39 1.024,0.39 1.414,-0c0.39,-0.391 0.39,-1.024 0,-1.414l-3.008,-3.009c-0.39,-0.39 -1.024,-0.39 -1.414,0c-0.182,0.181 -0.279,0.415 -0.292,0.652Z";

/** Path: street-light-svgrepo-com.svg (RECINTO_ABIERTO) */
const STREET_LIGHT_PATH =
  "M262.5 33l-10 30h87l-10-30h-67zM160 39c-26 0-45.2 9.12-56.9 23.24C91.32 76.35 87 94.5 87 112v263h18V112c0-14.5 3.7-28.35 11.9-38.24C125.2 63.88 138 57 160 57h75.5l6-18H160zm79.3 42l-43.7 42.5 41.9-19.1-34.5 86.9 62.6-58.3-1.1 91.7 31.8-101.2 70.5 117.6-31.3-130.9 61.5 36.1L349.5 81H239.3zM72.55 393l-5.08 100h57.03l-5.1-100H72.55z";

/** Path: fist-raised-svgrepo-com.svg (GAZTETXE) */
const FIST_RAISED_PATH =
  "M255.98 160V16c0-8.84-7.16-16-16-16h-32c-8.84 0-16 7.16-16 16v146.93c5.02-1.78 10.34-2.93 15.97-2.93h48.03zm128 95.99c-.01-35.34-28.66-63.99-63.99-63.99H207.85c-8.78 0-15.9 7.07-15.9 15.85v.56c0 26.27 21.3 47.59 47.57 47.59h35.26c9.68 0 13.2 3.58 13.2 8v16.2c0 4.29-3.59 7.78-7.88 8-44.52 2.28-64.16 24.71-96.05 72.55l-6.31 9.47a7.994 7.994 0 0 1-11.09 2.22l-13.31-8.88a7.994 7.994 0 0 1-2.22-11.09l6.31-9.47c15.73-23.6 30.2-43.26 47.31-58.08-17.27-5.51-31.4-18.12-38.87-34.45-6.59 3.41-13.96 5.52-21.87 5.52h-32c-12.34 0-23.49-4.81-32-12.48C71.48 251.19 60.33 256 48 256H16c-5.64 0-10.97-1.15-16-2.95v77.93c0 33.95 13.48 66.5 37.49 90.51L63.99 448v64h255.98v-63.96l35.91-35.92A96.035 96.035 0 0 0 384 344.21l-.02-88.22zm-32.01-90.09V48c0-8.84-7.16-16-16-16h-32c-8.84 0-16 7.16-16 16v112h32c11.28 0 21.94 2.31 32 5.9zM16 224h32c8.84 0 16-7.16 16-16V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v128c0 8.84 7.16 16 16 16zm95.99 0h32c8.84 0 16-7.16 16-16V48c0-8.84-7.16-16-16-16h-32c-8.84 0-16 7.16-16 16v160c0 8.84 7.16 16 16 16z";

/** Path: position-marker-svgrepo-com.svg (sin categoría) */
const POSITION_MARKER_PATH =
  "M256 17.108c-75.73 0-137.122 61.392-137.122 137.122.055 23.25 6.022 46.107 11.58 56.262L256 494.892l119.982-274.244h-.063c11.27-20.324 17.188-43.18 17.202-66.418C393.122 78.5 331.73 17.108 256 17.108zm0 68.56a68.56 68.56 0 0 1 68.56 68.562A68.56 68.56 0 0 1 256 222.79a68.56 68.56 0 0 1-68.56-68.56A68.56 68.56 0 0 1 256 85.67z";

/** Path: calendar-event-svgrepo-com.svg (Festivales) */
const CALENDAR_EVENT_PATH =
  "M81.6,4.73C81.6,2.12,84.18,0,87.37,0s5.77,2.12,5.77,4.73V25.45c0,2.61-2.58,4.73-5.77,4.73s-5.77-2.12-5.77-4.73V4.73Zm-19,56.57,6,13.91,15.07,1.35a1.2,1.2,0,0,1,1.1,1.31,1.18,1.18,0,0,1-.41.81h0l-11.41,10,3.37,14.75a1.2,1.2,0,0,1-.91,1.45,1.27,1.27,0,0,1-.94-.17l-13-7.74-13,7.78a1.22,1.22,0,0,1-1.66-.42,1.2,1.2,0,0,1-.14-.9h0L50,88.64l-11.4-10A1.22,1.22,0,0,1,38.48,77a1.26,1.26,0,0,1,.86-.4l15-1.34,6-13.93a1.21,1.21,0,0,1,1.59-.64,1.17,1.17,0,0,1,.65.64ZM29.61,4.73C29.61,2.12,32.19,0,35.38,0s5.77,2.12,5.77,4.73V25.45c0,2.61-2.58,4.73-5.77,4.73s-5.77-2.12-5.77-4.73V4.73ZM6.4,45.32H116.47V21.47a3,3,0,0,0-.86-2.07,2.92,2.92,0,0,0-2.07-.86H103a3.2,3.2,0,1,1,0-6.4h10.55a9.36,9.36,0,0,1,9.33,9.33v92.08a9.36,9.36,0,0,1-9.33,9.33H9.33A9.36,9.36,0,0,1,0,113.54V21.47a9.36,9.36,0,0,1,9.33-9.33H20.6a3.2,3.2,0,1,1,0,6.4H9.33a3,3,0,0,0-2.07.86,2.92,2.92,0,0,0-.86,2.07V45.32Zm110.07,6.41H6.4v61.81a3,3,0,0,0,.86,2.07,2.92,2.92,0,0,0,2.07.86H113.54a3,3,0,0,0,2.07-.86,2.92,2.92,0,0,0,.86-2.07V51.73Zm-66-33.19a3.2,3.2,0,0,1,0-6.4H71.91a3.2,3.2,0,1,1,0,6.4Z";

type VenueCategory = "TABERNA_BAR" | "SALA_CONCIERTOS" | "RECINTO_ABIERTO" | "GAZTETXE";

/** Clave para espacios sin categoría */
const SIN_CATEGORIA = "SIN_CATEGORIA" as const;

const MARKER_CONFIG: Record<
  VenueCategory | "FESTIVAL" | typeof SIN_CATEGORIA,
  { color: string; useStroke: boolean; paths: string[]; viewBox: string; fillRule?: "evenodd" }
> = {
  [SIN_CATEGORIA]: {
    color: COLORS.PUNK_WHITE,
    useStroke: false,
    paths: [POSITION_MARKER_PATH],
    viewBox: "0 0 512 512",
  },
  TABERNA_BAR: {
    color: COLORS.PUNK_PINK,
    useStroke: true,
    paths: PUB_BAR_PATHS,
    viewBox: "0 0 32 32",
  },
  SALA_CONCIERTOS: {
    color: COLORS.PUNK_GREEN,
    useStroke: false,
    paths: [GUITAR_PICK_PATH],
    viewBox: "0 0 32 32",
    fillRule: "evenodd",
  },
  RECINTO_ABIERTO: {
    color: COLORS.PUNK_YELLOW,
    useStroke: false,
    paths: [STREET_LIGHT_PATH],
    viewBox: "0 0 512 512",
  },
  GAZTETXE: {
    color: COLORS.PUNK_RED,
    useStroke: false,
    paths: [FIST_RAISED_PATH],
    viewBox: "-64 0 512 512",
  },
  FESTIVAL: {
    color: COLORS.PUNK_GREEN,
    useStroke: false,
    paths: [CALENDAR_EVENT_PATH],
    viewBox: "0 0 122.88 122.88",
  },
};

/** Marcador unificado: selecciona SVG y color según tipo y categoría */
export function MapMarker({
  type,
  category,
}: {
  type: "venue" | "festival";
  category?: string | null;
}) {
  const filterId = useId();
  const key: VenueCategory | "FESTIVAL" =
    type === "festival"
      ? "FESTIVAL"
      : (category as VenueCategory) ?? "TABERNA_BAR";
  const config = MARKER_CONFIG[key];
  const { color, useStroke, paths, viewBox, fillRule } = config;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={SIZE}
      height={SIZE}
      viewBox={viewBox}
      fill={useStroke ? "none" : color}
      fillRule={fillRule}
      stroke={useStroke ? color : undefined}
      strokeWidth={useStroke ? 2 : undefined}
      strokeLinecap={useStroke ? "round" : undefined}
      strokeLinejoin={useStroke ? "round" : undefined}
      strokeMiterlimit={useStroke ? 10 : undefined}
      style={{ filter: `url(#${filterId})` }}
    >
      <defs>
        <NeonGlowFilter id={filterId} color={color} />
      </defs>
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/** Marcador para espacios (MapPicker: sin categoría → marcador de posición) */
export function VenueMarker({ category }: { category?: string | null } = {}) {
  return <MapMarker type="venue" category={category} />;
}

/** Marcador para festivales */
export function FestivalMarker() {
  return <MapMarker type="festival" />;
}
