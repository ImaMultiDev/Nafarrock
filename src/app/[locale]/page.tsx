import { HeroSection } from "@/components/home/HeroSection";
import { ExploreSection } from "@/components/home/ExploreSection";
import { ExploreScrollIndicator } from "@/components/home/ExploreScrollIndicator";
import { ManifestoSection } from "@/components/home/ManifestoSection";
import { UpcomingEventsCarousel } from "@/components/home/UpcomingEventsCarousel";
import { getEvents, getFeaturedEvents } from "@/services/event.service";
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

  const featuredForHero = featuredEvents.map(toEventItem);
  const upcomingForCarousel = upcomingEvents.map(toEventItem);

  return (
    <main className="min-h-screen bg-punk-black">
      <HeroSection featuredEvents={featuredForHero} />
      <section className="px-6 pt-4 pb-8 sm:px-12 sm:pt-0 lg:px-20 lg:pb-12">
        <div className="mx-auto max-w-7xl 2xl:max-w-content-wide">
          <UpcomingEventsCarousel events={upcomingForCarousel} />
        </div>
      </section>
      <ExploreScrollIndicator variant="red" />
      <ExploreSection />
      <ManifestoSection />
    </main>
  );
}
