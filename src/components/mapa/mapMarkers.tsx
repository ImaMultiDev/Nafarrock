"use client";

import { DoorOpen } from "lucide-react";

const PINK = "#ff006e";
const GREEN = "#00C853";
const SIZE = 36;

/** Marcador para salas: icono de puerta (representa local/entrada) */
export function VenueMarker() {
  return <DoorOpen size={SIZE} strokeWidth={2} color={PINK} />;
}

/** Marcador para festivales: icono de notas musicales */
export function FestivalMarker() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={SIZE}
      height={SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke={GREEN}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
