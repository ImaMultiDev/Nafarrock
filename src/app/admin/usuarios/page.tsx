import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 20;

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminUsuariosPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id ?? null;

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        bandProfile: { select: { id: true, name: true, approved: true } },
        promoterProfile: { select: { id: true, name: true, approved: true } },
        venueProfile: { select: { id: true, name: true, approved: true } },
        organizerProfile: { select: { id: true, name: true, approved: true } },
        festivalProfile: { select: { id: true, name: true, approved: true } },
      },
  }),
    prisma.user.count(),
  ]);

  return (
    <>
      <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
        USUARIOS
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        {total} cuentas registradas del radar
      </p>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="border-b-2 border-punk-acid/50">
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Email
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Nombre
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Teléfono
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Rol
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Entidades
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-punk-white/10">
                <td className="py-3 font-body text-punk-white">{u.email}</td>
                <td className="py-3 font-body text-punk-white/80">
                  {u.firstName && u.lastName
                    ? `${u.firstName} ${u.lastName}`
                    : u.name ?? "—"}
                </td>
                <td className="py-3 font-body text-sm text-punk-white/60">
                  {u.phone ?? "—"}
                </td>
                <td className="py-3">
                  <span className="border border-punk-acid/50 bg-punk-acid/10 px-2 py-1 font-punch text-xs uppercase text-punk-acid">
                    {u.role}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    {u.bandProfile && (
                      <a
                        href={`/admin/bandas`}
                        className={`text-xs ${
                          u.bandProfile.approved ? "text-punk-green" : "text-punk-red"
                        }`}
                      >
                        Banda: {u.bandProfile.name}
                      </a>
                    )}
                    {u.venueProfile && (
                      <span
                        className={`text-xs ${
                          u.venueProfile.approved ? "text-punk-green" : "text-punk-red"
                        }`}
                      >
                        Sala: {u.venueProfile.name}
                      </span>
                    )}
                    {u.promoterProfile && (
                      <span
                        className={`text-xs ${
                          u.promoterProfile.approved ? "text-punk-green" : "text-punk-red"
                        }`}
                      >
                        Promotor: {u.promoterProfile.name}
                      </span>
                    )}
                    {u.organizerProfile && (
                      <span
                        className={`text-xs ${
                          u.organizerProfile.approved ? "text-punk-green" : "text-punk-red"
                        }`}
                      >
                        Organizador: {u.organizerProfile.name}
                      </span>
                    )}
                    {u.festivalProfile && (
                      <span
                        className={`text-xs ${
                          u.festivalProfile.approved ? "text-punk-green" : "text-punk-red"
                        }`}
                      >
                        Festival: {u.festivalProfile.name}
                      </span>
                    )}
                    {!u.bandProfile &&
                      !u.venueProfile &&
                      !u.promoterProfile &&
                      !u.organizerProfile &&
                      !u.festivalProfile && (
                        <span className="text-xs text-punk-white/40">—</span>
                      )}
                  </div>
                </td>
                <td className="py-3">
                  <DeleteUserButton
                    userId={u.id}
                    userEmail={u.email}
                    isCurrentUser={u.id === currentUserId}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalItems={total} pageSize={PAGE_SIZE} />

      <p className="mt-6 font-body text-sm text-punk-white/50">
        Las propuestas se aprueban desde Solicitudes. Eliminar borra el usuario y sus datos asociados.
      </p>
    </>
  );
}
