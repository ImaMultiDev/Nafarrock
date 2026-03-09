import { HeroSection } from "@/components/home/HeroSection";
import { ExploreSection } from "@/components/home/ExploreSection";
import { ManifestoSection } from "@/components/home/ManifestoSection";
import { getEvents } from "@/services/event.service";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("home.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function HomePage() {
  const { items: upcomingEvents } = await getEvents({
    pageSize: 5,
    includePast: false,
  });

  const eventsForHero = upcomingEvents.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    date: e.date,
    endDate: e.endDate,
    type: e.type,
    imageUrl: e.imageUrl,
    venue: e.venue ? { name: e.venue.name, city: e.venue.city } : null,
    venueText: e.venueText,
  }));

  return (
    <main className="min-h-screen bg-punk-black">
      <HeroSection upcomingEvents={eventsForHero} />
      <ExploreSection />
      <ManifestoSection />
    </main>
  );
}
