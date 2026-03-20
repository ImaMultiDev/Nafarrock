"use client";

import { Link } from "@/i18n/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { EventosFilters } from "@/components/buscador/EventosFilters";
import { EventosMobileView } from "./EventosMobileView";
import { Pagination } from "@/components/ui/Pagination";
import { EventosList } from "./EventosList";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

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
  festival: { name: string; slug: string; location: string | null } | null;
  isSoldOut?: boolean;
};

type Props = {
  events: EventItem[];
  total: number;
  page: number;
  searchParams: Record<string, string>;
};

/**
 * Variante clásica de /eventos: panel inferior móvil, lista virtual, cards desktop.
 */
export function EventosClassicView({
  events,
  total,
  page,
  searchParams,
}: Props) {
  const t = useTranslations("events");
  const tActions = useTranslations("common.actions");

  return (
    <PageLayout>
      <EventosMobileView />

      <AnimatedSection>
        <div className="mb-10 hidden sm:mb-16 lg:block">
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
            {t("subtitle", { count: total })}
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <div className="hidden lg:block">
          <EventosFilters />
        </div>
      </AnimatedSection>

      <div className="hidden pb-24 lg:block lg:pb-0">
        {events.length > 0 && <EventosList events={events} />}

        <Pagination
          page={page}
          totalItems={total}
          searchParams={
            Object.fromEntries(
              Object.entries({
                search: searchParams.search,
                type: searchParams.type,
              }).filter((entry): entry is [string, string] => {
                const v = entry[1];
                return v != null && v !== "";
              })
            ) as Record<string, string>
          }
        />

        {events.length === 0 && (
          <AnimatedSection delay={0.15}>
            <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
              <p className="font-body text-punk-white/60">{t("empty")}</p>
              <Link
                href="/"
                className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-red transition-colors hover:text-punk-red/80"
              >
                {tActions("backToHome")}
              </Link>
            </div>
          </AnimatedSection>
        )}
      </div>
    </PageLayout>
  );
}
