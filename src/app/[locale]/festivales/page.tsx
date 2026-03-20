import { getFestivals } from "@/services/festival.service";
import { Link } from "@/i18n/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { FestivalesMobileView } from "@/components/festivales/FestivalesMobileView";
import { FestivalesList } from "@/components/festivales/FestivalesList";
import { FestivalesOptimizedView } from "@/components/festivales/FestivalesOptimizedView";
import { Pagination } from "@/components/ui/Pagination";
import { getTranslations } from "next-intl/server";
import { FESTIVALES_VARIANT } from "@/lib/feature-flags";

export async function generateMetadata() {
  const t = await getTranslations("scene.festivals.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function FestivalesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const t = await getTranslations("scene.festivals");
  const { items: festivals, total } = await getFestivals(
    { page, search: params.search || undefined },
    true,
  );

  if (FESTIVALES_VARIANT === "optimized") {
    return <FestivalesOptimizedView />;
  }

  return (
    <PageLayout>
      {/* Mobile: panel + lista virtual con "Cargar más" y scroll hide/show */}
      <FestivalesMobileView />

      {/* Título y descripción: solo desktop */}
      <div className="mb-10 hidden sm:mb-16 lg:block">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          FESTIVALES
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          Festivales de rock en Nafarroa. {total} {total === 1 ? "festival" : "festivales"}.
        </p>
      </div>

      {/* Desktop: cards + paginación clásica */}
      <div className="hidden pb-24 lg:block lg:pb-0">
        {festivals.length > 0 && <FestivalesList festivals={festivals} />}

        <Pagination
          page={page}
          totalItems={total}
          searchParams={
            Object.fromEntries(
              Object.entries({ search: params.search }).filter((entry): entry is [string, string] => {
                const v = entry[1];
                return v != null && v !== "";
              })
            ) as Record<string, string>
          }
        />

        {festivals.length === 0 && (
          <div className="border-2 border-dashed border-punk-white/20 p-16 text-center">
            <p className="font-body text-punk-white/60">{t("empty")}</p>
            <Link
              href="/escena"
              className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-red transition-colors hover:text-punk-red/80"
            >
              ← Volver a Escena
            </Link>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
