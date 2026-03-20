import { getBands } from "@/services/band.service";
import { getTranslations } from "next-intl/server";
import { BandasClassicView } from "@/components/bandas/BandasClassicView";
import { BandasOptimizedView } from "@/components/bandas/BandasOptimizedView";
import { BANDAS_VARIANT } from "@/lib/feature-flags";

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
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const { items: bands, total } = await getBands({
    search: params.search || undefined,
    genre: params.genre || undefined,
    location: params.location || undefined,
    page,
  });

  if (BANDAS_VARIANT === "optimized") {
    return <BandasOptimizedView />;
  }

  return (
    <BandasClassicView
      bands={bands}
      total={total}
      page={page}
      searchParams={{
        search: params.search ?? "",
        genre: params.genre ?? "",
        location: params.location ?? "",
      }}
    />
  );
}
