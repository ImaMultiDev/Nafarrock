import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { routing } from "@/i18n/routing";

const LOCALES = routing.locales;
const DEFAULT_LOCALE = routing.defaultLocale;

function pathForLocale(path: string, locale: string): string {
  const p = path || "/";
  if (locale === DEFAULT_LOCALE) return p;
  return `/${locale}${p}`;
}

function makeAlternates(path: string): Record<string, string> {
  const base = getSiteUrl();
  return Object.fromEntries(
    LOCALES.map((l) => {
      const seg = pathForLocale(path, l);
      return [l, `${base}${seg}`];
    })
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const [bands, events, venues, festivals, promoters, organizers, associations] =
    await Promise.all([
      prisma.band.findMany({
        where: { approved: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.event.findMany({
        where: { isApproved: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.venue.findMany({
        where: { approved: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.festival.findMany({
        where: { approved: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.promoter.findMany({
        where: { approved: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.organizer.findMany({
        where: { approved: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.asociacion.findMany({
        where: { approved: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

  const staticPaths = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/bandas", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/eventos", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/tablon", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/escena", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/salas", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/festivales", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/promotores", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/organizadores", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/asociaciones", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/guia", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/buscar", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/contacto", priority: 0.6, changeFrequency: "monthly" as const },
  ];

  const urls: MetadataRoute.Sitemap = [];

  for (const { path, priority, changeFrequency } of staticPaths) {
    const fullPath = path === "" ? "/" : path;
    const defaultUrl = path === "" ? base : `${base}${fullPath}`;
    urls.push({
      url: defaultUrl,
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: makeAlternates(fullPath),
      },
    });
  }

  for (const band of bands) {
    const path = `/bandas/${band.slug}`;
    urls.push({
      url: `${base}${path}`,
      lastModified: band.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: { languages: makeAlternates(path) },
    });
  }

  for (const event of events) {
    const path = `/eventos/${event.slug}`;
    urls.push({
      url: `${base}${path}`,
      lastModified: event.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: { languages: makeAlternates(path) },
    });
  }

  for (const venue of venues) {
    const path = `/salas/${venue.slug}`;
    urls.push({
      url: `${base}${path}`,
      lastModified: venue.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages: makeAlternates(path) },
    });
  }

  for (const festival of festivals) {
    const path = `/festivales/${festival.slug}`;
    urls.push({
      url: `${base}${path}`,
      lastModified: festival.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: { languages: makeAlternates(path) },
    });
  }

  for (const promoter of promoters) {
    const path = `/promotores/${promoter.slug}`;
    urls.push({
      url: `${base}${path}`,
      lastModified: promoter.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: makeAlternates(path) },
    });
  }

  for (const organizer of organizers) {
    const path = `/organizadores/${organizer.slug}`;
    urls.push({
      url: `${base}${path}`,
      lastModified: organizer.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: makeAlternates(path) },
    });
  }

  for (const asoc of associations) {
    const path = `/asociaciones/${asoc.slug}`;
    urls.push({
      url: `${base}${path}`,
      lastModified: asoc.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: makeAlternates(path) },
    });
  }

  return urls;
}
