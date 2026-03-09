import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BoardAnnouncementActions } from "./BoardAnnouncementActions";
const CATEGORY_LABELS: Record<string, string> = {
  SE_BUSCA_MUSICO: "Se busca músico",
  SE_BUSCAN_BANDAS: "Se buscan bandas / Postulaciones",
  CONCURSO: "Concursos",
  LOCAL_MATERIAL: "Local y material",
  SERVICIOS: "Servicios",
  OTROS: "Otros",
};

export default async function AdminBolosPage() {
  const announcements = await prisma.boardAnnouncement.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pending = announcements.filter((a) => !a.approved);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            ANUNCIOS
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            {announcements.length} anuncios · {pending.length} pendientes de aprobar
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tablon"
            className="border-2 border-punk-white/30 px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white transition-all hover:border-punk-yellow hover:text-punk-yellow"
          >
            Ver página Anuncios
          </Link>
          <Link
            href="/admin/bolos/nuevo"
            className="border-2 border-punk-yellow bg-punk-yellow px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-yellow/90"
          >
            Crear anuncio
          </Link>
        </div>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b-2 border-punk-yellow/50">
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Título
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Categoría
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Territorio
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Fecha
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Estado
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((a) => (
              <tr key={a.id} className="border-b border-punk-white/10">
                <td className="py-3">
                  <Link
                    href={`/admin/tablon/${a.id}/editar`}
                    className="font-display text-punk-white hover:text-punk-yellow"
                  >
                    {a.title}
                  </Link>
                </td>
                <td className="py-3 font-body text-sm text-punk-white/80">
                  {CATEGORY_LABELS[a.category] ?? a.category}
                </td>
                <td className="py-3 font-body text-sm text-punk-white/60">
                  {a.territory ?? "—"}
                </td>
                <td className="py-3 font-body text-sm text-punk-white/60">
                  {format(a.createdAt, "d MMM yyyy", { locale: es })}
                </td>
                <td className="py-3">
                  <span
                    className={`inline-block px-2 py-1 font-punch text-xs uppercase ${
                      a.approved
                        ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                        : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                    }`}
                  >
                    {a.approved ? "Aprobado" : "Pendiente"}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/admin/tablon/${a.id}/editar`}
                      className="font-punch text-xs uppercase tracking-widest text-punk-yellow hover:text-punk-yellow/80"
                    >
                      Editar
                    </Link>
                    <BoardAnnouncementActions
                      id={a.id}
                      title={a.title}
                      approved={a.approved}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {announcements.length === 0 && (
        <div className="mt-12 border-2 border-dashed border-punk-white/20 p-12 text-center">
          <p className="font-body text-punk-white/60">No hay anuncios aún.</p>
          <Link
            href="/admin/bolos/nuevo"
            className="mt-4 inline-block border-2 border-punk-yellow bg-punk-yellow px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-black hover:bg-punk-yellow/90"
          >
            Crear primer anuncio
          </Link>
        </div>
      )}
    </>
  );
}
