import { getEvents } from "@/services/event.service";
import { Link } from "@/i18n/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { EventosFilters } from "@/components/buscador/EventosFilters";
import { EventosMobileView } from "@/components/eventos/EventosMobileView";
import { Pagination } from "@/components/ui/Pagination";
import { EventosList } from "@/components/eventos/EventosList";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("events.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function EventosPage({ searchParams }: Props) {
  const t = await getTranslations("events");
  const tActions = await getTranslations("common.actions");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const { items: events, total } = await getEvents({
    search: params.search || undefined,
    type: (params.type as "CONCIERTO" | "FESTIVAL") || undefined,
    page,
    includePast: false,
  });

  return (
    <PageLayout>
      {/* Mobile: panel + lista virtual con "Cargar más" */}
      <EventosMobileView />

      {/* Título y descripción: solo desktop */}
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

      {/* Filtros: solo desktop */}
      <AnimatedSection delay={0.1}>
        <div className="hidden lg:block">
          <EventosFilters />
        </div>
      </AnimatedSection>

      {/* Desktop: cards + paginación clásica */}
      <div className="hidden pb-24 lg:block lg:pb-0">
        {events.length > 0 && <EventosList events={events} />}

        <Pagination
          page={page}
          totalItems={total}
          searchParams={
            Object.fromEntries(
              Object.entries({
                search: params.search,
                type: params.type,
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
