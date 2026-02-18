import { prisma } from "@/lib/prisma";
import { ApproveButton } from "@/components/admin/ApproveButton";

export default async function AdminPromotoresPage() {
  const promoters = await prisma.promoter.findMany({
    orderBy: { name: "asc" },
    include: { user: { select: { email: true } } },
  });

  const pending = promoters.filter((p) => !p.approved);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            PROMOTORES
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            {promoters.length} promotores · {pending.length} pendientes de aprobar
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
            {promoters.map((p) => (
              <tr key={p.id} className="border-b border-punk-white/10">
                <td className="py-3 font-display text-punk-white">{p.name}</td>
                <td className="py-3 font-body text-punk-white/70">{p.user?.email ?? "—"}</td>
                <td className="py-3">
                  <span
                    className={`inline-block px-2 py-1 font-punch text-xs uppercase ${
                      p.approved
                        ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                        : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                    }`}
                  >
                    {p.approved ? "Aprobado" : "Pendiente"}
                  </span>
                </td>
                <td className="py-3">
                  <ApproveButton entity="promoter" id={p.id} approved={p.approved} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {promoters.length === 0 && (
        <div className="mt-12 border-2 border-dashed border-punk-white/20 p-12 text-center">
          <p className="font-body text-punk-white/60">
            No hay promotores registrados.
          </p>
        </div>
      )}
    </>
  );
}
