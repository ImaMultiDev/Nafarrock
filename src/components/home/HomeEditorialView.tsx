"use client";

import { HeroSection } from "./HeroSection";
import { ExploreSection } from "./ExploreSection";
import { ExploreScrollIndicator } from "./ExploreScrollIndicator";
import { ManifestoSection } from "./ManifestoSection";
import { InstallAppSection } from "./InstallAppSection";
import { UpcomingEventsCarousel } from "./UpcomingEventsCarousel";

type EventItem = {
  id: string;
  slug: string;
  title: string;
  date: Date | string;
  endDate: Date | string | null;
  type: string;
  imageUrl: string | null;
  venue: { name: string; city: string } | null;
  venueText: string | null;
};

type Props = {
  featuredEvents: EventItem[];
  upcomingEvents: EventItem[];
};

/**
 * Variante editorial del home: hero con guitarra, explorar, manifiesto.
 * Diseño actual conservado para poder volver a él.
 */
export function HomeEditorialView({
  featuredEvents,
  upcomingEvents,
}: Props) {
  return (
    <main className="min-h-screen bg-punk-black">
      <HeroSection featuredEvents={featuredEvents} />
      <section className="px-6 pt-4 pb-8 sm:px-12 sm:pt-0 lg:px-20 lg:pb-12">
        <div className="mx-auto max-w-7xl 2xl:max-w-content-wide">
          <UpcomingEventsCarousel events={upcomingEvents} />
        </div>
      </section>
      <ExploreScrollIndicator variant="red" />
      <ExploreSection />
      <ManifestoSection />
      <InstallAppSection />
    </main>
  );
}
