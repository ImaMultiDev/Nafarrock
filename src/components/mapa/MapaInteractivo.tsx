"use client";

import { useState } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
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
  logoUrl?: string;
};

type Props = {
  points: MapPoint[];
};

const NAVARRA_CENTER = { longitude: -1.65, latitude: 42.8, zoom: 9 };

export function MapaInteractivo({ points }: Props) {
  const [popupInfo, setPopupInfo] = useState<MapPoint | null>(null);

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
          No hay salas ni festivales con ubicación para mostrar en el mapa.
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
    <div className="h-[500px] w-full overflow-hidden rounded border-2 border-punk-red">
      <Map
        mapboxAccessToken={token}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
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
              <VenueMarker />
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
            className="nafarrock-popup"
          >
            <div className="min-w-[200px]">
              <div className="flex items-start gap-3">
                {popupInfo.logoUrl && (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-punk-pink/50 bg-punk-black">
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
                    className="font-display font-semibold text-punk-pink hover:underline"
                  >
                    {popupInfo.name}
                  </Link>
                  {popupInfo.city && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-punk-white/70">
                      <MapPin size={12} />
                      {popupInfo.city}
                    </p>
                  )}
                  <span className="mt-2 inline-flex items-center gap-1 text-xs uppercase text-punk-green">
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
