import { getFestivals } from "@/services/festival.service";
import { Link } from "@/i18n/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { FestivalesMobilePanel } from "@/components/festivales/FestivalesMobilePanel";
import { Pagination } from "@/components/ui/Pagination";
import { getTranslations } from "next-intl/server";

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

  return (
    <PageLayout>
      {/* Mobile: panel inferior fijo con buscador */}
      <FestivalesMobilePanel />

      {/* Título y descripción: solo desktop */}
      <div className="mb-10 hidden sm:mb-16 md:block">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
          FESTIVALES
        </h1>
        <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
          Festivales de rock en Nafarroa. {total} {total === 1 ? "festival" : "festivales"}.
        </p>
      </div>

      {/* Cards, paginación y empty: en mobile empiezan desde arriba; padding-bottom para el panel fijo */}
      <div className="pb-24 md:pb-0">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {festivals.map((festival) => (
          <Link
            key={festival.id}
            href={`/festivales/${festival.slug}`}
            className="group relative block min-w-0 overflow-hidden border-2 border-punk-red bg-punk-black p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(230,0,38,0.2)] max-[299px]:p-3"
          >
            <div
              className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-punk-red"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
            />
            <div className="aspect-[4/3] min-h-0 min-w-0 overflow-hidden border border-punk-white/10">
              {festival.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={festival.logoUrl}
                  alt={festival.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-punk-black/80 font-display text-4xl text-punk-red/50">
                  {festival.name.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="mt-4 font-display text-xl tracking-tighter text-punk-white transition-colors group-hover:text-punk-red">
              {festival.name}
            </h2>
            {festival.location && (
              <p className="mt-2 font-body text-sm text-punk-white/70">
                {festival.location}
              </p>
            )}
          </Link>
        ))}
      </div>

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
