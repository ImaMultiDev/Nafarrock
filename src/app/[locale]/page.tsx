import { HomeEditorialView } from "@/components/home/HomeEditorialView";
import { HomeDataFocusedView } from "@/components/home/HomeDataFocusedView";
import { getEvents, getFeaturedEvents } from "@/services/event.service";
import { HOME_VARIANT } from "@/lib/feature-flags";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("home.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

function toEventItem(e: {
  id: string;
  slug: string;
  title: string;
  date: Date;
  endDate: Date | null;
  type: string;
  imageUrl: string | null;
  venue: { name: string; city: string } | null;
  venueText: string | null;
}) {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    date: e.date,
    endDate: e.endDate,
    type: e.type,
    imageUrl: e.imageUrl,
    venue: e.venue ? { name: e.venue.name, city: e.venue.city } : null,
    venueText: e.venueText,
  };
}

export default async function HomePage() {
  const [featuredEvents, { items: upcomingEvents }] = await Promise.all([
    getFeaturedEvents(4),
    getEvents({ pageSize: 12, includePast: false }),
  ]);

  const featured = featuredEvents.map(toEventItem);
  const upcoming = upcomingEvents.map(toEventItem);

  if (HOME_VARIANT === "data-focused") {
    return (
      <HomeDataFocusedView
        featuredEvents={featured}
        upcomingEvents={upcoming}
      />
    );
  }

  return (
    <HomeEditorialView
      featuredEvents={featured}
      upcomingEvents={upcoming}
    />
  );
}
