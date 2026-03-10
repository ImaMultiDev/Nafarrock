"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import mapboxgl from "mapbox-gl";
import { GuitarPickMarkerVenue, GuitarPickMarkerFestival } from "./guitarPickMarker";

const NAVARRA_CENTER = { longitude: -1.65, latitude: 42.8, zoom: 10 };

type Props = {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
  height?: number;
  zoom?: number;
  variant?: "venue" | "festival";
};

export function MapPicker({
  value,
  onChange,
  height = 280,
  zoom = 10,
  variant = "venue",
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.lat, lng: value.lng } : null
  );
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const geocoderContainerRef = useRef<HTMLDivElement>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);

  const handlePositionChange = useCallback(
    (p: { lat: number; lng: number }) => {
      setPosition(p);
      onChange(p.lat, p.lng);
    },
    [onChange]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (value && (!position || value.lat !== position.lat || value.lng !== position.lng)) {
      setPosition({ lat: value.lat, lng: value.lng });
    }
  }, [value?.lat, value?.lng]);

  const onMapLoad = useCallback(() => {
    if (!mapRef.current || !geocoderContainerRef.current || geocoderRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    const geocoder = new MapboxGeocoder({
      accessToken: token,
      mapboxgl,
      marker: false,
      countries: "es",
      placeholder: "Buscar dirección o local (ej: Mercado Santo Domingo, Pamplona)",
      types: "address,place,poi",
    });

    geocoder.on("result", (e: { result: { center: [number, number] } }) => {
      const [lng, lat] = e.result.center;
      handlePositionChange({ lat, lng });
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 17 });
    });

    geocoderContainerRef.current.appendChild(geocoder.onAdd(mapRef.current));
    geocoderRef.current = geocoder;
  }, [handlePositionChange]);

  useEffect(() => {
    return () => {
      geocoderRef.current?.onRemove();
      geocoderRef.current = null;
    };
  }, []);

  if (!mounted) {
    return (
      <div
        className="flex items-center justify-center border-2 border-punk-red bg-punk-black/60"
        style={{ height }}
      >
        <span className="font-body text-punk-white/60">Cargando mapa…</span>
      </div>
    );
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return (
      <div
        className="flex items-center justify-center border-2 border-punk-red bg-punk-black/60"
        style={{ height }}
      >
        <span className="font-body text-punk-white/60">
          Configura NEXT_PUBLIC_MAPBOX_TOKEN para mostrar el mapa.
        </span>
      </div>
    );
  }

  const initialViewState = position
    ? { longitude: position.lng, latitude: position.lat, zoom }
    : NAVARRA_CENTER;

  return (
    <div className="relative overflow-hidden rounded border-2 border-punk-red">
      <div style={{ height }} className="relative">
        <div ref={geocoderContainerRef} className="absolute left-3 top-3 z-10 w-[calc(100%-24px)]" />
        <Map
          ref={(ref) => {
            if (ref) mapRef.current = ref.getMap();
          }}
          mapboxAccessToken={token}
          initialViewState={initialViewState}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          onLoad={onMapLoad}
          onClick={(e) => {
            handlePositionChange({ lat: e.lngLat.lat, lng: e.lngLat.lng });
          }}
        >
          {position && (
            <Marker
              longitude={position.lng}
              latitude={position.lat}
              anchor="bottom"
              draggable
              onDragEnd={(e) => {
                const { lng, lat } = e.target.getLngLat();
                handlePositionChange({ lat, lng });
              }}
            >
              {variant === "festival" ? (
                <GuitarPickMarkerFestival />
              ) : (
                <GuitarPickMarkerVenue />
              )}
            </Marker>
          )}
        </Map>
      </div>
      <p className="border-t border-punk-white/10 bg-punk-black/80 px-3 py-2 font-body text-xs text-punk-white/60">
        Busca una dirección o local, o haz clic en el mapa para colocar el marcador. Arrástralo para
        ajustar la posición.
      </p>
    </div>
  );
}
