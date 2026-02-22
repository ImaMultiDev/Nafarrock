import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AnnouncementActions } from "./AnnouncementActions";

export default async function AdminBolosPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      promoter: { select: { name: true, slug: true } },
      venue: { select: { name: true, slug: true } },
      festival: { select: { name: true, slug: true } },
      organizer: { select: { name: true, slug: true } },
    },
  });

  const pending = announcements.filter((a) => !a.isApproved && a.status === "PENDING");

  function advertiserName(a: (typeof announcements)[0]): string {
    return a.promoter?.name ?? a.venue?.name ?? a.festival?.name ?? a.organizer?.name ?? "";
  }

  function advertiserType(a: (typeof announcements)[0]): string {
    if (a.promoter) return "Promotor";
    if (a.venue) return "Sala";
    if (a.festival) return "Festival";
    if (a.organizer) return "Organizador";
    return "";
  }

  return (
    <>
      <div>
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
          ANUNCIOS / BOLOS
        </h1>
        <p className="mt-2 font-body text-punk-white/60">
          {announcements.length} anuncios · {pending.length} pendientes de aprobar
        </p>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b-2 border-punk-green/50">
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Título
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Anunciante
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
                    href={a.isApproved ? `/bolos/${a.id}` : `/admin/bolos/${a.id}`}
                    className="font-display text-punk-white hover:text-punk-green"
                  >
                    {a.title}
                  </Link>
                </td>
                <td className="py-3 font-body text-sm text-punk-white/80">
                  {advertiserType(a)} · {advertiserName(a)}
                </td>
                <td className="py-3 font-body text-sm text-punk-white/60">
                  {format(a.createdAt, "d MMM yyyy", { locale: es })}
                </td>
                <td className="py-3">
                  <span
                    className={`inline-block px-2 py-1 font-punch text-xs uppercase ${
                      a.isApproved
                        ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                        : a.status === "REJECTED"
                          ? "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                          : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                    }`}
                  >
                    {a.isApproved ? "Activo" : a.status === "REJECTED" ? "Rechazado" : "Pendiente"}
                  </span>
                </td>
                <td className="py-3">
                  <AnnouncementActions
                    id={a.id}
                    isApproved={a.isApproved}
                    status={a.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {announcements.length === 0 && (
        <div className="mt-12 border-2 border-dashed border-punk-white/20 p-12 text-center">
          <p className="font-body text-punk-white/60">No hay anuncios aún.</p>
        </div>
      )}
    </>
  );
}
