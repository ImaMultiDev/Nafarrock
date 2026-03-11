"use client";

import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("./MapPicker").then((m) => m.MapPicker), {
  ssr: false,
});

type Props = {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
  height?: number;
  zoom?: number;
  variant?: "venue" | "festival";
  category?: string | null;
};

export function MapPickerWrapper(props: Props) {
  return <MapPicker {...props} />;
}
