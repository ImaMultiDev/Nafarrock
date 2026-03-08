import { getBands } from "@/services/band.service";
import { getTranslations } from "next-intl/server";
import { PageLayout } from "@/components/ui/PageLayout";
import { BandasFilters } from "@/components/buscador/BandasFilters";
import { Pagination } from "@/components/ui/Pagination";
import { BandasList } from "@/components/bandas/BandasList";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Link } from "@/i18n/navigation";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata() {
  const t = await getTranslations("bands.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function BandasPage({ searchParams }: Props) {
  const t = await getTranslations("bands");
  const tActions = await getTranslations("common.actions");
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const { items: bands, total } = await getBands({
    search: params.search || undefined,
    genre: params.genre || undefined,
    location: params.location || undefined,
    page,
  });

  return (
    <PageLayout>
      <AnimatedSection>
        <div className="mb-10 sm:mb-16">
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
            {t(total === 1 ? "count" : "count_other", { count: total })}
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <BandasFilters />
      </AnimatedSection>

      {bands.length > 0 && <BandasList bands={bands} />}

      <Pagination
        page={page}
        totalItems={total}
        searchParams={
          Object.fromEntries(
            Object.entries({
              search: params.search,
              genre: params.genre,
              location: params.location,
            }).filter((entry): entry is [string, string] => {
          const v = entry[1];
          return v != null && v !== "";
        })
          ) as Record<string, string>
        }
      />

      {bands.length === 0 && (
        <AnimatedSection delay={0.15}>
        <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
          <p className="font-body text-punk-white/60">
            {t("empty")}
          </p>
          <Link href="/" className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-green hover:text-punk-green/80 transition-colors">
            ← {tActions("backToHome")}
          </Link>
        </div>
        </AnimatedSection>
      )}
    </PageLayout>
  );
}
