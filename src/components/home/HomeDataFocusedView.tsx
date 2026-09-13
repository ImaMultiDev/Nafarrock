"use client";

import { DataFocusedEvents } from "./DataFocusedEvents";
import { ExploreSection } from "./ExploreSection";
import { ManifestoSection } from "./ManifestoSection";
import { InstallAppSection } from "./InstallAppSection";

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
 * Home centrado en datos.
 * Orden: próximos eventos → explorar → manifiesto.
 * (Hero logo/tagline oculto)
 */
export function HomeDataFocusedView({
  upcomingEvents,
}: Props) {
  return (
    <main className="min-h-screen bg-punk-black">
      <DataFocusedEvents events={upcomingEvents} />
      <ExploreSection />
      <ManifestoSection />
      <InstallAppSection />
    </main>
  );
}
