import { getEvents } from "@/services/event.service";
import { EventosClassicView } from "@/components/eventos/EventosClassicView";
import { EventosOptimizedView } from "@/components/eventos/EventosOptimizedView";
import { EVENTOS_VARIANT } from "@/lib/feature-flags";
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
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const { items: events, total } = await getEvents({
    search: params.search || undefined,
    type: (params.type as "CONCIERTO" | "FESTIVAL") || undefined,
    page,
    includePast: false,
  });

  if (EVENTOS_VARIANT === "optimized") {
    return <EventosOptimizedView />;
  }

  return (
    <EventosClassicView
      events={events}
      total={total}
      page={page}
      searchParams={{
        search: params.search ?? "",
        type: params.type ?? "",
      }}
    />
  );
}
