import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ApproveButton } from "@/components/admin/ApproveButton";

export default async function AdminFestivalesPage() {
  const festivals = await prisma.festival.findMany({
    orderBy: { name: "asc" },
    include: { user: { select: { email: true } } },
  });

  const pending = festivals.filter((f) => !f.approved);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            FESTIVALES
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            {festivals.length} festivales · {pending.length} pendientes de aprobar
          </p>
        </div>
        <Link
          href="/admin/festivales/nueva"
          className="border-2 border-punk-red bg-punk-red px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-red/90"
        >
          Registrar festival
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b-2 border-punk-pink/50">
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Nombre
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Propietario
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
            {festivals.map((f) => (
              <tr key={f.id} className="border-b border-punk-white/10">
                <td className="py-3 font-display text-punk-white">{f.name}</td>
                <td className="py-3 font-body text-punk-white/70">
                  {f.user?.email ?? (
                    <span className="text-punk-red">Nafarrock</span>
                  )}
                </td>
                <td className="py-3">
                  <span
                    className={`inline-block px-2 py-1 font-punch text-xs uppercase ${
                      f.approved
                        ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                        : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                    }`}
                  >
                    {f.approved ? "Aprobado" : "Pendiente"}
                  </span>
                </td>
                <td className="py-3">
                  <ApproveButton entity="festival" id={f.id} approved={f.approved} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {festivals.length === 0 && (
        <div className="mt-12 border-2 border-dashed border-punk-white/20 p-12 text-center">
          <p className="font-body text-punk-white/60">
            No hay festivales registrados.
          </p>
        </div>
      )}
    </>
  );
}
