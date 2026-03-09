import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const EDITORIAL_MVP_MODE = true;
import { ApproveButton } from "@/components/admin/ApproveButton";
import { RejectFlow } from "@/components/admin/RejectFlow";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 20;

type PendingItem = {
  id: string;
  type: "band" | "venue" | "festival" | "association" | "promoter" | "organizer" | "event" | "boardAnnouncement";
  name: string;
  slug: string;
  email: string | null;
  editUrl: string;
  publicUrl: string;
  createdAt: Date;
};

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminSolicitudesPage({ searchParams }: Props) {
  await requireAdmin();

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [bands, venues, festivals, asociaciones, promoters, organizers, events, boardAnnouncements] = await Promise.all([
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
    prisma.event.findMany({
      where: { isApproved: false, createdByUserId: { not: null } },
      include: { createdByUser: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.boardAnnouncement.findMany({
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
    event: "Evento",
  };

  const allItems: PendingItem[] = [
    ...bands.map((b) => ({
      id: b.id,
      type: "band" as const,
      name: b.name,
      slug: b.slug,
      email: b.user?.email ?? null,
      editUrl: `/admin/bandas/${b.id}/editar`,
      publicUrl: `/bandas/${b.slug}`,
      createdAt: b.createdAt,
    })),
    ...venues.map((v) => ({
      id: v.id,
      type: "venue" as const,
      name: v.name,
      slug: v.slug,
      email: v.user?.email ?? null,
      editUrl: `/admin/salas/${v.id}/editar`,
      publicUrl: `/salas/${v.slug}`,
      createdAt: v.createdAt,
    })),
    ...festivals.map((f) => ({
      id: f.id,
      type: "festival" as const,
      name: f.name,
      slug: f.slug,
      email: f.user?.email ?? null,
      editUrl: "/admin/festivales",
      publicUrl: `/festivales/${f.slug}`,
      createdAt: f.createdAt,
    })),
    ...asociaciones.map((a) => ({
      id: a.id,
      type: "association" as const,
      name: a.name,
      slug: a.slug,
      email: a.user?.email ?? null,
      editUrl: "/admin/asociaciones",
      publicUrl: `/asociaciones/${a.slug}`,
      createdAt: a.createdAt,
    })),
    ...promoters.map((p) => ({
      id: p.id,
      type: "promoter" as const,
      name: p.name,
      slug: p.slug,
      email: p.user?.email ?? null,
      editUrl: "/admin/promotores",
      publicUrl: `/promotores/${p.slug}`,
      createdAt: p.createdAt,
    })),
    ...organizers.map((o) => ({
      id: o.id,
      type: "organizer" as const,
      name: o.name,
      slug: o.slug,
      email: o.user?.email ?? null,
      editUrl: "/admin/organizadores",
      publicUrl: `/organizadores/${o.slug}`,
      createdAt: o.createdAt,
    })),
    ...events.map((e) => ({
      id: e.id,
      type: "event" as const,
      name: e.title,
      slug: e.slug,
      email: e.createdByUser?.email ?? null,
      editUrl: `/admin/eventos/${e.id}/editar`,
      publicUrl: `/eventos/${e.slug}`,
      createdAt: e.createdAt,
    })),
    ...boardAnnouncements.map((a) => ({
      id: a.id,
      type: "boardAnnouncement" as const,
      name: a.title,
      slug: a.id,
      email: a.user?.email ?? a.contactEmail,
      editUrl: `/admin/tablon/${a.id}/editar`,
      publicUrl: `/tablon`,
      createdAt: a.createdAt,
    })),
  ]
    .filter((item) => (EDITORIAL_MVP_MODE ? item.type === "band" || item.type === "event" || item.type === "boardAnnouncement" : true))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = allItems.length;
  const items = allItems.slice(skip, skip + PAGE_SIZE);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            SOLICITUDES
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            {total} bandas, eventos y anuncios propuestos por usuarios
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
              No hay bandas, eventos ni anuncios propuestos pendientes de aprobar.
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
                    <div className="flex flex-wrap items-center gap-2">
                      {item.type === "event" ? (
                        <>
                          <ApproveButton entity="event" id={item.id} approved={false} />
                          <DeleteButton entity="event" id={item.id} label="Rechazar" />
                        </>
                      ) : (
                        <>
                          <ApproveButton
                            entity={item.type as "band" | "venue" | "festival" | "association" | "promoter" | "organizer" | "boardAnnouncement"}
                            id={item.id}
                            approved={false}
                          />
                          <RejectFlow
                            entity={item.type as "band" | "venue" | "festival" | "association" | "promoter" | "organizer" | "boardAnnouncement"}
                            id={item.id}
                          />
                        </>
                      )}
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

      <Pagination page={page} totalItems={total} pageSize={PAGE_SIZE} />
    </>
  );
}
