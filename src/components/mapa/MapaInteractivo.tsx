"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Music } from "lucide-react";
import { VenueMarker, FestivalMarker } from "./mapMarkers";

export type MapPoint = {
  id: string;
  name: string;
  slug: string;
  type: "venue" | "festival";
  lat: number;
  lng: number;
  city?: string;
  address?: string;
  /** Categoría del espacio (solo para type=venue). Preparado para iconos futuros. */
  category?: string;
  logoUrl?: string;
};

type Props = {
  points: MapPoint[];
};

const NAVARRA_CENTER = { longitude: -1.65, latitude: 42.8, zoom: 9 };

export function MapaInteractivo({ points }: Props) {
  const [popupInfo, setPopupInfo] = useState<MapPoint | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const resizeMap = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (map) map.resize();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(resizeMap);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [resizeMap]);

  useEffect(() => {
    const handleResize = () => requestAnimationFrame(resizeMap);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resizeMap]);

  const onMapLoad = useCallback(() => {
    requestAnimationFrame(() => {
      resizeMap();
      // Segundo resize tras un frame: en móvil el layout puede no estar listo al primer paint
      requestAnimationFrame(() => resizeMap());
    });
  }, [resizeMap]);

  const validPoints = points.filter(
    (p) =>
      typeof p.lat === "number" &&
      typeof p.lng === "number" &&
      !Number.isNaN(p.lat) &&
      !Number.isNaN(p.lng)
  );

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return (
      <div className="flex min-h-[400px] items-center justify-center border-2 border-punk-red bg-punk-black/60">
        <p className="font-body text-punk-white/70">
          Configura NEXT_PUBLIC_MAPBOX_TOKEN para mostrar el mapa.
        </p>
      </div>
    );
  }

  if (validPoints.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center border-2 border-punk-red bg-punk-black/60">
        <p className="font-body text-punk-white/70">
          No hay espacios ni festivales con ubicación para mostrar en el mapa.
        </p>
      </div>
    );
  }

  const initialViewState =
    validPoints.length === 1
      ? {
          longitude: validPoints[0].lng,
          latitude: validPoints[0].lat,
          zoom: 12,
        }
      : NAVARRA_CENTER;

  return (
    <div
      ref={containerRef}
      className="h-[500px] min-h-[400px] w-full overflow-hidden rounded border-2 border-punk-red"
    >
      <Map
        ref={(ref) => {
          mapRef.current = ref;
        }}
        mapboxAccessToken={token}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        onLoad={onMapLoad}
      >
        {validPoints.map((point) => (
          <Marker
            key={`${point.type}-${point.id}`}
            longitude={point.lng}
            latitude={point.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupInfo(point);
            }}
          >
            {point.type === "venue" ? (
              <VenueMarker category={point.category} />
            ) : (
              <FestivalMarker />
            )}
          </Marker>
        ))}
        {popupInfo && (
          <Popup
            longitude={popupInfo.lng}
            latitude={popupInfo.lat}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
            className={`nafarrock-popup nafarrock-popup-${popupInfo.type}`}
          >
            <div className="min-w-[200px]">
              <div className="flex items-start gap-3">
                {popupInfo.logoUrl && (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border-2 border-punk-pink/50 bg-punk-black">
                    <Image
                      src={popupInfo.logoUrl}
                      alt={popupInfo.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/${popupInfo.type === "venue" ? "salas" : "festivales"}/${popupInfo.slug}`}
                    className="font-display font-semibold text-punk-pink hover:text-punk-pink/90 hover:underline"
                  >
                    {popupInfo.name}
                  </Link>
                  {popupInfo.address && (
                    <p className="mt-1 text-xs text-punk-white/60">
                      {popupInfo.address}
                    </p>
                  )}
                  {popupInfo.city && !popupInfo.address && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-punk-white/70">
                      <MapPin size={12} />
                      {popupInfo.city}
                    </p>
                  )}
                  {popupInfo.city && popupInfo.address && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-punk-white/50">
                      <MapPin size={10} />
                      {popupInfo.city}
                    </p>
                  )}
                  <span
                    className={`mt-2 inline-flex items-center gap-1 text-xs font-punch uppercase tracking-widest ${
                      popupInfo.type === "venue"
                        ? "text-punk-pink"
                        : "text-punk-green"
                    }`}
                  >
                    <Music size={12} />
                    {popupInfo.type === "venue" ? "Sala" : "Festival"}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
