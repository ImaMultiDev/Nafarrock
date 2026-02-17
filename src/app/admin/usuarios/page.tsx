import { prisma } from "@/lib/prisma";

export default async function AdminUsuariosPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
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
  });

  const pendingEntities = users.filter(
    (u) =>
      (u.bandProfile && !u.bandProfile.approved) ||
      (u.promoterProfile && !u.promoterProfile.approved) ||
      (u.venueProfile && !u.venueProfile.approved) ||
      (u.organizerProfile && !u.organizerProfile.approved) ||
      (u.festivalProfile && !u.festivalProfile.approved)
  );

  return (
    <>
      <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
        USUARIOS
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        {users.length} usuarios · {pendingEntities.length} con entidades pendientes de aprobar
      </p>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 font-body text-sm text-punk-white/50">
        Aprobar entidades desde Bandas, Salas o Eventos. Los promotores, organizadores y festivales se aprueban en sus respectivas secciones cuando se implementen.
      </p>
    </>
  );
}
