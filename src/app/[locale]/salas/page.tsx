import { getVenues } from "@/services/venue.service";
import { Link } from "@/i18n/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { SalasFilters } from "@/components/buscador/SalasFilters";
import { SalasMobileView } from "@/components/salas/SalasMobileView";
import { SalasList } from "@/components/salas/SalasList";
import { SalasOptimizedView } from "@/components/salas/SalasOptimizedView";
import { Pagination } from "@/components/ui/Pagination";
import { getTranslations } from "next-intl/server";
import { SALAS_VARIANT } from "@/lib/feature-flags";

export async function generateMetadata() {
  const t = await getTranslations("scene.venues.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function SalasPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const capacityMin = params.capacityMin ? parseInt(params.capacityMin, 10) : undefined;
  const capacityMax = params.capacityMax ? parseInt(params.capacityMax, 10) : undefined;
  const { items: venues, total } = await getVenues({
    search: params.search || undefined,
    city: params.city || undefined,
    category: params.category || undefined,
    capacityMin: Number.isNaN(capacityMin) ? undefined : capacityMin,
    capacityMax: Number.isNaN(capacityMax) ? undefined : capacityMax,
    page,
  });

  const t = await getTranslations("scene.venues");

  if (SALAS_VARIANT === "optimized") {
    return <SalasOptimizedView />;
  }

  return (
    <PageLayout>
      {/* Mobile: panel + lista virtual con "Cargar más" y scroll hide/show */}
      <SalasMobileView />

      {/* Título y descripción: solo desktop */}
      <div className="mb-10 hidden sm:mb-16 lg:block">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          {t("metadata.title").toUpperCase()}
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          {t("desc")}. {t(total === 1 ? "count" : "count_other", { count: total })}
        </p>
      </div>

      {/* Filtros: solo desktop */}
      <div className="hidden lg:block">
        <SalasFilters />
      </div>

      {/* Desktop: cards + paginación clásica */}
      <div className="hidden pb-24 lg:block lg:pb-0">
        {venues.length > 0 && <SalasList venues={venues} />}

        <Pagination
        page={page}
        totalItems={total}
        searchParams={
          Object.fromEntries(
            Object.entries({
              search: params.search,
              city: params.city,
              category: params.category,
              capacityMin: params.capacityMin,
              capacityMax: params.capacityMax,
            }).filter((entry): entry is [string, string] => {
              const v = entry[1];
              return v != null && v !== "";
            })
          ) as Record<string, string>
        }
        />

        {venues.length === 0 && (
        <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
          <p className="font-body text-punk-white/60">{t("empty")}</p>
          <Link href="/escena" className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-pink transition-colors hover:text-punk-pink/80">
            ← Volver a Escena
          </Link>
        </div>
        )}
      </div>
    </PageLayout>
  );
}
