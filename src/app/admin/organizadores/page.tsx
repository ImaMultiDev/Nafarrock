import { prisma } from "@/lib/prisma";
import { ApproveButton } from "@/components/admin/ApproveButton";

export default async function AdminOrganizadoresPage() {
  const organizers = await prisma.organizer.findMany({
    orderBy: { name: "asc" },
    include: { user: { select: { email: true } } },
  });

  const pending = organizers.filter((o) => !o.approved);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            ORGANIZADORES
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            {organizers.length} organizadores · {pending.length} pendientes de aprobar
          </p>
        </div>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b-2 border-punk-pink/50">
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Nombre
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Email
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
            {organizers.map((o) => (
              <tr key={o.id} className="border-b border-punk-white/10">
                <td className="py-3 font-display text-punk-white">{o.name}</td>
                <td className="py-3 font-body text-punk-white/70">{o.user?.email ?? "—"}</td>
                <td className="py-3">
                  <span
                    className={`inline-block px-2 py-1 font-punch text-xs uppercase ${
                      o.approved
                        ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                        : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                    }`}
                  >
                    {o.approved ? "Aprobado" : "Pendiente"}
                  </span>
                </td>
                <td className="py-3">
                  <ApproveButton entity="organizer" id={o.id} approved={o.approved} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {organizers.length === 0 && (
        <div className="mt-12 border-2 border-dashed border-punk-white/20 p-12 text-center">
          <p className="font-body text-punk-white/60">
            No hay organizadores registrados.
          </p>
        </div>
      )}
    </>
  );
}
