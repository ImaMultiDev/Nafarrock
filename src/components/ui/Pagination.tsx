"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

const DEFAULT_PAGE_SIZE = 12;
const MAX_VISIBLE_PAGES = 7; // Mostrar como máximo 7 números (ej: 1 ... 4 5 6 ... 10)

export type PaginationProps = {
  page: number;
  totalItems: number;
  pageSize?: number;
  searchParams?: Record<string, string>;
};

export function Pagination({
  page,
  totalItems,
  pageSize = DEFAULT_PAGE_SIZE,
  searchParams = {},
}: PaginationProps) {
  const pathname = usePathname();
  const t = useTranslations("pagination");
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  if (totalPages <= 1) return null;

  const buildUrl = (newPage: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v != null && v !== "") params.set(k, String(v));
    });
    params.set("page", String(newPage));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : `${pathname}?page=${newPage}`;
  };

  const resultLabel = totalItems === 1 ? t("result") : t("results");

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [];
    const showLeft = page > 3;
    const showRight = page < totalPages - 2;

    if (showLeft) {
      pages.push(1);
      if (page > 4) pages.push("ellipsis");
    }
    const start = showLeft ? Math.max(1, page - 2) : 1;
    const end = showRight ? Math.min(totalPages, page + 2) : totalPages;
    for (let i = start; i <= end; i++) pages.push(i);
    if (showRight) {
      if (page < totalPages - 3) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const prevButton = hasPrev ? (
    <Link
      href={buildUrl(page - 1)}
      className="flex items-center justify-center gap-2 border-2 border-punk-white/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-colors hover:border-punk-green hover:text-punk-green"
    >
      <ChevronLeft className="h-4 w-4" />
      {t("previous")}
    </Link>
  ) : (
    <span className="flex items-center justify-center gap-2 border-2 border-punk-white/10 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/30">
      <ChevronLeft className="h-4 w-4" />
      {t("previous")}
    </span>
  );

  const nextButton = hasNext ? (
    <Link
      href={buildUrl(page + 1)}
      className="flex items-center justify-center gap-2 border-2 border-punk-white/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-colors hover:border-punk-green hover:text-punk-green"
    >
      {t("next")}
      <ChevronRight className="h-4 w-4" />
    </Link>
  ) : (
    <span className="flex items-center justify-center gap-2 border-2 border-punk-white/10 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/30">
      {t("next")}
      <ChevronRight className="h-4 w-4" />
    </span>
  );

  return (
    <nav
      className="mt-12 flex flex-col items-center gap-4 border-t border-punk-white/10 pt-8"
      aria-label="Paginación"
    >
      {/* Mobile: Anterior arriba, números centro, Siguiente abajo. Desktop: todo en fila */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
        <div className="order-1 sm:order-1 w-full sm:w-auto flex justify-center">{prevButton}</div>
        <div className="order-2 flex items-center gap-1">
          {pageNumbers.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`ell-${i}`} className="px-2 font-body text-punk-white/40">
                …
              </span>
            ) : (
              <span key={p}>
                {p === page ? (
                  <span className="inline-flex h-9 min-w-9 items-center justify-center border-2 border-punk-green bg-punk-green/20 px-3 font-punch text-xs uppercase tracking-widest text-punk-green">
                    {p}
                  </span>
                ) : (
                  <Link
                    href={buildUrl(p)}
                    className="inline-flex h-9 min-w-9 items-center justify-center border-2 border-punk-white/30 px-3 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-colors hover:border-punk-green hover:text-punk-green"
                  >
                    {p}
                  </Link>
                )}
              </span>
            )
          )}
        </div>
        <div className="order-3 sm:order-3 w-full sm:w-auto flex justify-center">{nextButton}</div>
      </div>

      <span className="font-body text-sm text-punk-white/60">
        {t("pageOf", { page, total: totalPages })}
        <span className="ml-2 text-punk-white/40">
          ({totalItems} {resultLabel})
        </span>
      </span>
    </nav>
  );
}
