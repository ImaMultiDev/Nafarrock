"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Link } from "@/i18n/navigation";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { getDateLocale } from "@/lib/date-locale";
import type { Locale } from "date-fns";
import { EventosMobilePanel } from "./EventosMobilePanel";

type FilterValue = "" | "CONCIERTO" | "FESTIVAL";

type EventItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  endDate: string | null;
  type: string;
  imageUrl: string | null;
  venue: { name: string; city: string } | null;
  venueText: string | null;
  festival: { name: string; slug: string; location: string | null } | null;
  isSoldOut?: boolean;
};

const PAGE_SIZE = 12;
const CARD_HEIGHT_ESTIMATE = 200;
const CARD_GAP = 12;

async function fetchEventos(
  page: number,
  type: FilterValue,
  search: string
): Promise<{ items: EventItem[]; total: number; hasMore: boolean }> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(PAGE_SIZE));
  if (type) params.set("type", type);
  if (search.trim()) params.set("search", search.trim());
  const res = await fetch(`/api/eventos?${params.toString()}`);
  if (!res.ok) throw new Error("Error al cargar eventos");
  return res.json();
}

function EventCard({
  event,
  tFilters,
  tEventDetail,
  dateLocale,
}: {
  event: EventItem;
  tFilters: (k: string) => string;
  tEventDetail: (k: string) => string;
  dateLocale: Locale;
}) {
  const d = new Date(event.date);
  const endD = event.endDate ? new Date(event.endDate) : null;
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group relative block overflow-hidden border-2 border-punk-red bg-punk-black p-4 transition-all duration-300 active:scale-[0.99] hover:shadow-[0_0_40px_rgba(230,0,38,0.15)]"
    >
      {event.imageUrl && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-[position:center_top] opacity-[0.15]"
            style={{ backgroundImage: `url(${event.imageUrl})` }}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-punk-black via-punk-black/70 to-transparent"
            aria-hidden
          />
        </>
      )}
      <div
        className="absolute right-0 top-0 h-12 w-12 border-t-2 border-r-2 border-punk-red"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
      />
      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="shrink-0 border-2 border-punk-red/50 bg-punk-red/10 px-4 py-2 text-center">
          <span className="block font-display text-2xl leading-none text-punk-red">
            {endD
              ? `${format(d, "d", { locale: dateLocale })}-${format(endD, "d", { locale: dateLocale })}`
              : format(d, "dd", { locale: dateLocale })}
          </span>
          <span className="block font-punch text-[10px] uppercase tracking-widest text-punk-white/70">
            {format(d, "MMM", { locale: dateLocale })}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg tracking-tighter text-punk-white transition-colors group-hover:text-punk-red line-clamp-2">
            {event.title}
          </h2>
          <p className="mt-0.5 font-body text-sm text-punk-white/70 line-clamp-1">
            {event.venue
              ? `${event.venue.name} · ${event.venue.city}`
              : event.festival?.location ?? event.venueText ?? ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <span
            className={`border-2 px-3 py-1.5 font-punch text-[10px] uppercase tracking-widest ${
              event.type === "FESTIVAL"
                ? "border-punk-red bg-punk-red/20 text-punk-red"
                : "border-punk-white/40 bg-punk-black text-punk-white/90"
            }`}
          >
            {event.type === "FESTIVAL" ? tFilters("festival") : tFilters("concert")}
          </span>
          {event.isSoldOut && (
            <span className="border-2 border-punk-red bg-punk-red/30 px-3 py-1.5 font-punch text-[10px] uppercase tracking-widest text-punk-red">
              {tEventDetail("soldOut")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function EventosMobileView() {
  const t = useTranslations("events");
  const tFilters = useTranslations("filters.eventos");
  const tEventDetail = useTranslations("eventDetail");
  const locale = useLocale();
  const dateLocale = getDateLocale(locale);

  const [filter, setFilter] = useState<FilterValue>("");
  const [search, setSearch] = useState("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["eventos", filter, search],
    queryFn: ({ pageParam }) => fetchEventos(pageParam, filter, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    staleTime: 5 * 60 * 1000, // 5 min cache - cambio de filtro instantáneo
  });

  const allEvents = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: allEvents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT_ESTIMATE,
    overscan: 5,
    gap: CARD_GAP,
  });

  const handleSearchSubmit = useCallback(
    (s: string) => setSearch(s),
    [],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Scroll Hide/Show: ocultar panel al bajar, mostrar al subir
  const [panelVisible, setPanelVisible] = useState(true);
  const lastScrollTop = useRef(0);
  const SCROLL_THRESHOLD = 8;

  // Mostrar panel al cambiar filtros (el usuario está interactuando)
  useEffect(() => {
    setPanelVisible(true);
  }, [filter, search]);

  useEffect(() => {
    const el = parentRef.current;
    if (!el || allEvents.length === 0) return;
    const onScroll = () => {
      const scrollTop = el.scrollTop;
      const delta = scrollTop - lastScrollTop.current;
      if (Math.abs(delta) < SCROLL_THRESHOLD) return;
      setPanelVisible(delta < 0);
      lastScrollTop.current = scrollTop;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [allEvents.length]);

  return (
    <>
      <EventosMobilePanel
        visible={panelVisible}
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        onSubmit={handleSearchSubmit}
        controlled
      />
      <div className="flex flex-col pb-24 md:hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-punk-red border-t-transparent" />
            <p className="mt-4 font-body text-punk-white/60">{t("loading") || "Cargando..."}</p>
          </div>
        ) : isError ? (
          <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
            <p className="font-body text-punk-white/60">{t("error") || "Error al cargar eventos"}</p>
          </div>
        ) : allEvents.length === 0 ? (
          <div className="border-2 border-punk-white/20 border-dashed p-16 text-center">
            <p className="font-body text-punk-white/60">{t("empty")}</p>
          </div>
        ) : (
          <div
            ref={parentRef}
            className="h-[calc(100dvh-3.5rem-8rem)] overflow-auto overscroll-contain"
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const event = allEvents[virtualRow.index];
                return (
                  <div
                    key={event.id}
                    ref={virtualizer.measureElement}
                    data-index={virtualRow.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="px-0"
                  >
                    <EventCard
                      event={event}
                      tFilters={tFilters}
                      tEventDetail={tEventDetail}
                      dateLocale={dateLocale}
                    />
                  </div>
                );
              })}
            </div>
            {/* Botón "Cargar más" al final de la lista - visible al hacer scroll hasta abajo */}
            {hasNextPage && (
              <div className="flex justify-center px-4 py-6">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="map-filter-btn flex items-center gap-2 font-punch text-xs uppercase tracking-widest"
                >
                  {isFetchingNextPage ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-punk-green border-t-transparent" />
                      {t("loading") || "Cargando..."}
                    </>
                  ) : (
                    t("loadMore") || "Cargar más"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
