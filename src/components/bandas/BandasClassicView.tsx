"use client";

import { Link } from "@/i18n/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { BandasFilters } from "@/components/buscador/BandasFilters";
import { BandasMobileView } from "./BandasMobileView";
import { Pagination } from "@/components/ui/Pagination";
import { BandasList } from "./BandasList";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { useTranslations } from "next-intl";

type BandItem = {
  id: string;
  slug: string;
  name: string;
  genres: string[];
  location: string | null;
  logoUrl: string | null;
  imageUrl: string | null;
  images: string[] | null;
};

type Props = {
  bands: BandItem[];
  total: number;
  page: number;
  searchParams: Record<string, string>;
};

/**
 * Variante clásica de /bandas: panel inferior móvil, lista virtual, cards desktop.
 */
export function BandasClassicView({
  bands,
  total,
  page,
  searchParams,
}: Props) {
  const t = useTranslations("bands");
  const tActions = useTranslations("common.actions");

  return (
    <PageLayout>
      <BandasMobileView />

      <AnimatedSection>
        <div className="mb-10 hidden sm:mb-16 lg:block">
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
            {t(total === 1 ? "count" : "count_other", { count: total })}
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <div className="hidden lg:block">
          <BandasFilters />
        </div>
      </AnimatedSection>

      <div className="hidden pb-24 lg:block lg:pb-0">
        {bands.length > 0 && <BandasList bands={bands} />}

        <Pagination
          page={page}
          totalItems={total}
          searchParams={
            Object.fromEntries(
              Object.entries({
                search: searchParams.search,
                genre: searchParams.genre,
                location: searchParams.location,
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
              <p className="font-body text-punk-white/60">{t("empty")}</p>
              <Link
                href="/"
                className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-green transition-colors hover:text-punk-green/80"
              >
                ← {tActions("backToHome")}
              </Link>
            </div>
          </AnimatedSection>
        )}
      </div>
    </PageLayout>
  );
}
