import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ApproveButton } from "@/components/admin/ApproveButton";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminSalasPage() {
  const venues = await prisma.venue.findMany({
    orderBy: { name: "asc" },
    include: { user: { select: { email: true } } },
  });

  const pending = venues.filter((v) => !v.approved);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            SALAS
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            {venues.length} salas · {pending.length} pendientes de aprobar
          </p>
        </div>
        <Link
          href="/admin/salas/nueva"
          className="border-2 border-punk-pink bg-punk-pink px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-pink/90"
        >
          Registrar sala
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
                Ciudad
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
            {venues.map((v) => (
              <tr key={v.id} className="border-b border-punk-white/10">
                <td className="py-3">
                  <Link
                    href={`/salas/${v.slug}`}
                    className="font-display text-punk-white hover:text-punk-pink"
                  >
                    {v.name}
                  </Link>
                </td>
                <td className="py-3 font-body text-punk-white/70">{v.city}</td>
                <td className="py-3">
                  <span
                    className={`inline-block px-2 py-1 font-punch text-xs uppercase ${
                      v.approved
                        ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                        : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                    }`}
                  >
                    {v.approved ? "Aprobada" : "Pendiente"}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <ApproveButton entity="venue" id={v.id} approved={v.approved} />
                    <Link
                      href={`/admin/salas/${v.id}/editar`}
                      className="border-2 border-punk-white/30 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:border-punk-pink hover:text-punk-pink"
                    >
                      Editar
                    </Link>
                    <DeleteButton entity="venue" id={v.id} label="Borrar" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {venues.length === 0 && (
        <div className="mt-12 border-2 border-dashed border-punk-white/20 p-12 text-center">
          <p className="font-body text-punk-white/60">
            No hay salas. Crea una con el botón "Registrar sala".
          </p>
        </div>
      )}
    </>
  );
}
