"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "./MapaInteractivo";

const MapaInteractivo = dynamic(() => import("./MapaInteractivo").then((m) => m.MapaInteractivo), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center border-2 border-punk-red bg-punk-black/60">
      <p className="font-body text-punk-white/70">Cargando mapa…</p>
    </div>
  ),
});

type Props = {
  points: MapPoint[];
};

export function MapaWrapper({ points }: Props) {
  return <MapaInteractivo points={points} />;
}
