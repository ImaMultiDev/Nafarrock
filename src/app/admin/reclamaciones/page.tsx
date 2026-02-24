import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ClaimActions } from "./ClaimActions";

export default async function AdminReclamacionesPage() {
  await requireAdmin();

  const claims = await prisma.profileClaim.findMany({
    where: { status: "PENDING_CLAIM" },
    include: {
      user: { select: { id: true, email: true, name: true } },
      band: { select: { id: true, name: true, slug: true } },
      venue: { select: { id: true, name: true, slug: true, city: true } },
      festival: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const getEntityInfo = (c: (typeof claims)[0]) => {
    if (c.band) return { name: c.band.name, slug: c.band.slug, type: "Banda", url: `/bandas/${c.band.slug}` };
    if (c.venue) return { name: c.venue.name, slug: c.venue.slug, type: "Sala", url: `/salas/${c.venue.slug}` };
    if (c.festival) return { name: c.festival.name, slug: c.festival.slug, type: "Festival", url: `/festivales/${c.festival.slug}` };
    if (c.entityType === "ASOCIACION") return { name: "—", slug: "", type: "Asociación", url: "/admin/asociaciones" };
    return { name: "—", slug: "", type: "—", url: "#" };
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            RECLAMACIONES
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            {claims.length} solicitudes pendientes de aprobar
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
        {claims.length === 0 ? (
          <div className="border-2 border-dashed border-punk-white/20 p-12 text-center">
            <p className="font-body text-punk-white/60">
              No hay solicitudes de reclamación pendientes.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b-2 border-punk-red/50">
                <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                  Usuario
                </th>
                <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                  Perfil
                </th>
                <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                  Mensaje
                </th>
                <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => {
                const info = getEntityInfo(c);
                return (
                  <tr key={c.id} className="border-b border-punk-white/10">
                    <td className="py-3">
                      <p className="font-display text-punk-white">{c.user.name ?? c.user.email}</p>
                      <p className="font-body text-sm text-punk-white/60">{c.user.email}</p>
                    </td>
                    <td className="py-3">
                      <Link
                        href={info.url}
                        className="font-display text-punk-red hover:underline"
                      >
                        {info.name}
                      </Link>
                      <p className="font-body text-xs text-punk-white/50">{info.type}</p>
                    </td>
                    <td className="py-3 font-body text-sm text-punk-white/70">
                      {c.message ? c.message.slice(0, 80) + (c.message.length > 80 ? "…" : "") : "—"}
                    </td>
                    <td className="py-3">
                      <ClaimActions claimId={c.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
