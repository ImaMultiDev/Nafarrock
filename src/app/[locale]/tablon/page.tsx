import { getBoardAnnouncements } from "@/services/board-announcement.service";
import { getTranslations } from "next-intl/server";
import { PageLayout } from "@/components/ui/PageLayout";
import { TablonFilters } from "@/components/tablon/TablonFilters";
import { TablonMobileView } from "@/components/tablon/TablonMobileView";
import { TablonList } from "@/components/tablon/TablonList";
import { Pagination } from "@/components/ui/Pagination";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Link } from "@/i18n/navigation";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata() {
  const t = await getTranslations("boardAnnouncement.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function TablonPage({ searchParams }: Props) {
  const t = await getTranslations("boardAnnouncement");
  const tActions = await getTranslations("common.actions");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const { items: announcements, total } = await getBoardAnnouncements({
    category: params.category as "SE_BUSCA_MUSICO" | "SE_BUSCAN_BANDAS" | "CONCURSO" | "LOCAL_MATERIAL" | "SERVICIOS" | "OTROS" | undefined,
    territory: params.territory || undefined,
    page,
  });

  return (
    <PageLayout>
      {/* Mobile: panel + lista virtual con "Cargar más" y scroll hide/show */}
      <TablonMobileView />

      {/* Título y descripción: solo desktop */}
      <AnimatedSection>
        <div className="mb-10 hidden sm:mb-16 lg:block">
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
            {t("subtitle")}
          </p>
        </div>
      </AnimatedSection>

      {/* Filtros: solo desktop */}
      <AnimatedSection delay={0.1}>
        <div className="hidden lg:block">
          <TablonFilters />
        </div>
      </AnimatedSection>

      {/* Desktop: cards + paginación clásica */}
      <div className="hidden pb-24 lg:block lg:pb-0">
        {announcements.length > 0 && <TablonList announcements={announcements} />}

        <Pagination
          page={page}
          totalItems={total}
          searchParams={
            Object.fromEntries(
              Object.entries({
                category: params.category,
                territory: params.territory,
              }).filter((entry): entry is [string, string] => {
                const v = entry[1];
                return v != null && v !== "";
              })
            ) as Record<string, string>
          }
        />

        {announcements.length === 0 && (
          <AnimatedSection delay={0.15}>
            <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
              <p className="font-body text-punk-white/60">{t("empty")}</p>
              <Link
                href="/"
                className="mt-4 inline-block font-punch text-sm uppercase tracking-widest text-punk-yellow transition-colors hover:text-punk-yellow/80"
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
