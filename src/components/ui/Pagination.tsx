"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_PAGE_SIZE = 12;

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

  return (
    <nav
      className="mt-12 flex flex-wrap items-center justify-center gap-4 border-t border-punk-white/10 pt-8"
      aria-label="Paginación"
    >
      {hasPrev ? (
        <Link
          href={buildUrl(page - 1)}
          className="flex items-center gap-2 border-2 border-punk-white/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-colors hover:border-punk-green hover:text-punk-green"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Link>
      ) : (
        <span className="flex items-center gap-2 border-2 border-punk-white/10 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/30">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </span>
      )}

      <span className="font-body text-sm text-punk-white/60">
        Página {page} de {totalPages}
        <span className="ml-2 text-punk-white/40">
          ({totalItems} {totalItems === 1 ? "resultado" : "resultados"})
        </span>
      </span>

      {hasNext ? (
        <Link
          href={buildUrl(page + 1)}
          className="flex items-center gap-2 border-2 border-punk-white/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-colors hover:border-punk-green hover:text-punk-green"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-2 border-2 border-punk-white/10 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/30">
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
