import { prisma } from "@/lib/prisma";
import { getCoordinatesForCity } from "@/lib/city-coordinates";
import { MapaWrapper } from "@/components/mapa/MapaWrapper";
import { MapPageBodyOverflow } from "@/components/mapa/MapPageBodyOverflow";
import type { MapPoint } from "@/components/mapa/MapaInteractivo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("map");
  return {
    title: t("title"),
    description: t("description"),
  };
}

function toMapPoint(
  v: {
    id: string;
    name: string;
    slug: string;
    city: string;
    address?: string | null;
    category?: string | null;
    latitude: number | null;
    longitude: number | null;
    logoUrl?: string | null;
  },
  type: "venue" | "festival",
): MapPoint | null {
  let lat: number;
  let lng: number;
  if (v.latitude != null && v.longitude != null) {
    lat = v.latitude;
    lng = v.longitude;
  } else {
    const coords = getCoordinatesForCity(v.city);
    if (!coords) return null;
    lat = coords.lat;
    lng = coords.lng;
  }
  return {
    id: v.id,
    name: v.name,
    slug: v.slug,
    type,
    lat,
    lng,
    city: v.city,
    address: v.address ?? undefined,
    category: v.category ?? undefined,
    logoUrl: v.logoUrl ?? undefined,
  };
}

export default async function MapaPage() {
  const [venues, festivals] = await Promise.all([
    prisma.venue.findMany({
      where: { approved: true, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        address: true,
        category: true,
        latitude: true,
        longitude: true,
        logoUrl: true,
      },
    }),
    prisma.festival.findMany({
      where: { approved: true },
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        latitude: true,
        longitude: true,
        logoUrl: true,
      },
    }),
  ]);

  const venuePoints: MapPoint[] = [];
  for (const v of venues) {
    const point = toMapPoint(
      {
        ...v,
        city: v.city,
        address: v.address,
        category: v.category,
        latitude: v.latitude,
        longitude: v.longitude,
        logoUrl: v.logoUrl,
      },
      "venue",
    );
    if (point) venuePoints.push(point);
  }

  const festivalPoints: MapPoint[] = [];
  for (const f of festivals) {
    const city = f.location ?? "Pamplona";
    const point = toMapPoint(
      {
        id: f.id,
        name: f.name,
        slug: f.slug,
        city,
        address: f.location,
        latitude: f.latitude,
        longitude: f.longitude,
        logoUrl: f.logoUrl,
      },
      "festival",
    );
    if (point) festivalPoints.push(point);
  }

  const points = [...venuePoints, ...festivalPoints];

  return (
    <>
      <MapPageBodyOverflow />
      <main className="relative h-[calc(100dvh-3.5rem)] min-h-0 overflow-hidden bg-punk-black md:min-h-screen md:h-auto md:overflow-visible">
      {/* Grid sutil de fondo */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,200,83,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,83,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(230,0,38,0.08)_0%,transparent_50%)]" />
      <div className="relative z-10 px-0 py-0 lg:px-20 lg:py-10">
        <MapaWrapper points={points} />
      </div>
    </main>
    </>
  );
}
