"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const PATH_LABELS: Record<string, string> = {
  dashboard: "Panel",
  perfil: "Mi perfil",
  banda: "Mi banda",
  sala: "Mi sala",
  festival: "Mi festival",
  promotor: "Mi promotor",
  organizador: "Mi organizador",
  eventos: "Mis eventos",
  editar: "Editar",
  nuevo: "Nuevo",
  bolos: "Bolos",
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.replace("/dashboard", "").split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/dashboard" + segments.slice(0, i + 1).join("/");
    let label = PATH_LABELS[seg];
    if (!label) {
      if (/^[a-f0-9-]{36}$/i.test(seg)) {
        label = segments[0] === "eventos" ? "Evento" : segments[0] === "bolos" ? "Anuncio" : "Detalle";
      } else {
        label = seg;
      }
    }
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 font-punch text-xs uppercase tracking-widest text-punk-white/60">
      <Link href="/dashboard" className="transition-colors hover:text-punk-green">
        Panel
      </Link>
      {crumbs.map(({ href, label, isLast }) => (
        <span key={href} className="flex items-center gap-1">
          <ChevronRight size={14} className="text-punk-white/40" />
          {isLast ? (
            <span className="text-punk-white/90">{label}</span>
          ) : (
            <Link href={href} className="transition-colors hover:text-punk-green">
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
