"use client";

import { DataFocusedHero } from "./DataFocusedHero";
import { DataFocusedEvents } from "./DataFocusedEvents";
import { DataFocusedQuickLinks } from "./DataFocusedQuickLinks";
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
 * Variante del home centrada en datos: eventos destacados y próximos como foco principal.
 * Mobile-first, UI/UX agradable. Desktop con grid optimizado.
 */
export function HomeDataFocusedView({
  featuredEvents,
  upcomingEvents,
}: Props) {
  return (
    <main className="min-h-screen bg-punk-black">
      <DataFocusedHero featuredEvents={featuredEvents} />
      <DataFocusedEvents events={upcomingEvents} />
      <DataFocusedQuickLinks />
      <ManifestoSection />
      <InstallAppSection />
    </main>
  );
}
