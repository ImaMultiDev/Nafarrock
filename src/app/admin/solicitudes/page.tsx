import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ApproveButton } from "@/components/admin/ApproveButton";

type PendingItem = {
  id: string;
  type: "band" | "venue" | "festival" | "association" | "promoter" | "organizer";
  name: string;
  slug: string;
  email: string | null;
  editUrl: string;
  publicUrl: string;
};

export default async function AdminSolicitudesPage() {
  await requireAdmin();

  const [bands, venues, festivals, asociaciones, promoters, organizers] = await Promise.all([
    prisma.band.findMany({
      where: { approved: false, userId: { not: null } },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.venue.findMany({
      where: { approved: false, userId: { not: null } },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.festival.findMany({
      where: { approved: false, userId: { not: null } },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.asociacion.findMany({
      where: { approved: false, userId: { not: null } },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.promoter.findMany({
      where: { approved: false },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.organizer.findMany({
      where: { approved: false },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const typeLabels: Record<string, string> = {
    band: "Banda",
    venue: "Sala",
    festival: "Festival",
    association: "Asociación",
    promoter: "Promotor",
    organizer: "Organizador",
  };

  const items: PendingItem[] = [
    ...bands.map((b) => ({
      id: b.id,
      type: "band" as const,
      name: b.name,
      slug: b.slug,
      email: b.user?.email ?? null,
      editUrl: `/admin/bandas/${b.id}/editar`,
      publicUrl: `/bandas/${b.slug}`,
    })),
    ...venues.map((v) => ({
      id: v.id,
      type: "venue" as const,
      name: v.name,
      slug: v.slug,
      email: v.user?.email ?? null,
      editUrl: `/admin/salas/${v.id}/editar`,
      publicUrl: `/salas/${v.slug}`,
    })),
    ...festivals.map((f) => ({
      id: f.id,
      type: "festival" as const,
      name: f.name,
      slug: f.slug,
      email: f.user?.email ?? null,
      editUrl: "/admin/festivales",
      publicUrl: `/festivales/${f.slug}`,
    })),
    ...asociaciones.map((a) => ({
      id: a.id,
      type: "association" as const,
      name: a.name,
      slug: a.slug,
      email: a.user?.email ?? null,
      editUrl: "/admin/asociaciones",
      publicUrl: `/asociaciones/${a.slug}`,
    })),
    ...promoters.map((p) => ({
      id: p.id,
      type: "promoter" as const,
      name: p.name,
      slug: p.slug,
      email: p.user?.email ?? null,
      editUrl: "/admin/promotores",
      publicUrl: `/promotores/${p.slug}`,
    })),
    ...organizers.map((o) => ({
      id: o.id,
      type: "organizer" as const,
      name: o.name,
      slug: o.slug,
      email: o.user?.email ?? null,
      editUrl: "/admin/organizadores",
      publicUrl: `/organizadores/${o.slug}`,
    })),
  ].sort((a, b) => 0); // Mantener orden por tipo, luego por fecha (simplificado)

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            SOLICITUDES
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            {items.length} perfiles pendientes de aprobación
          </p>
        </div>
        <Link
          href="/admin"
          className="border-2 border-punk-white/30 px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
        >
          ← Admin
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto">
        {items.length === 0 ? (
          <div className="border-2 border-dashed border-punk-white/20 p-12 text-center">
            <p className="font-body text-punk-white/60">
              No hay solicitudes de aprobación pendientes.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b-2 border-punk-yellow/50">
                <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                  Tipo
                </th>
                <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                  Nombre
                </th>
                <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                  Email
                </th>
                <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="border-b border-punk-white/10">
                  <td className="py-3">
                    <span className="font-punch text-xs uppercase text-punk-yellow/90">
                      {typeLabels[item.type]}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link
                      href={item.publicUrl}
                      className="font-display text-punk-white hover:text-punk-yellow"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="py-3 font-body text-sm text-punk-white/60">
                    {item.email ?? "—"}
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <ApproveButton
                        entity={item.type as "band" | "venue" | "festival" | "association" | "promoter" | "organizer"}
                        id={item.id}
                        approved={false}
                      />
                      <Link
                        href={item.editUrl}
                        className="border-2 border-punk-white/30 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:border-punk-white hover:text-punk-white"
                      >
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
