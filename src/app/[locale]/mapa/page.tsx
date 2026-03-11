import { prisma } from "@/lib/prisma";
import { getCoordinatesForCity } from "@/lib/city-coordinates";
import { PageLayout } from "@/components/ui/PageLayout";
import { MapaWrapper } from "@/components/mapa/MapaWrapper";
import type { MapPoint } from "@/components/mapa/MapaInteractivo";
import { EscenaBackNav } from "@/components/escena/EscenaBackNav";
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
  const t = await getTranslations("map");

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
    <PageLayout>
      <div className="mb-10 sm:mb-16">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          {t("title")}
        </h1>
      </div>

      <MapaWrapper points={points} />
    </PageLayout>
  );
}
