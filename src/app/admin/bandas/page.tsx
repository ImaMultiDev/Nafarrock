import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ApproveButton } from "@/components/admin/ApproveButton";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminBandasPage() {
  const bands = await prisma.band.findMany({
    orderBy: { name: "asc" },
    include: { user: { select: { email: true } } },
  });

  const pending = bands.filter((b) => !b.approved);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            BANDAS
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            {bands.length} bandas · {pending.length} pendientes de aprobar
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/bandas/nueva"
            className="border-2 border-punk-green bg-punk-green px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90"
          >
            Registrar banda
          </Link>
          <Link
            href="/admin/importacion-bandas"
            className="border-2 border-punk-white/30 px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-green hover:text-punk-green"
          >
            Importar CSV
          </Link>
        </div>
      </div>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b-2 border-punk-green/50">
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Nombre
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Estado
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Email propietario
              </th>
              <th className="py-3 font-punch text-xs uppercase tracking-widest text-punk-white/70">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {bands.map((b) => (
              <tr key={b.id} className="border-b border-punk-white/10">
                <td className="py-3">
                  <Link
                    href={`/bandas/${b.slug}`}
                    className="font-display text-punk-white hover:text-punk-green"
                  >
                    {b.name}
                  </Link>
                </td>
                <td className="py-3">
                  <span
                    className={`inline-block px-2 py-1 font-punch text-xs uppercase ${
                      b.approved
                        ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                        : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                    }`}
                  >
                    {b.approved ? "Aprobada" : "Pendiente"}
                  </span>
                </td>
                <td className="py-3 font-body text-sm text-punk-white/60">
                  {b.user?.email ?? <span className="text-punk-red">Nafarrock</span>}
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    <ApproveButton entity="band" id={b.id} approved={b.approved} />
                    <Link
                      href={`/admin/bandas/${b.id}/editar`}
                      className="border-2 border-punk-white/30 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:border-punk-green hover:text-punk-green"
                    >
                      Editar
                    </Link>
                    <DeleteButton entity="band" id={b.id} label="Borrar" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bands.length === 0 && (
        <div className="mt-12 border-2 border-dashed border-punk-white/20 p-12 text-center">
          <p className="font-body text-punk-white/60">
            No hay bandas. Crea una con el botón &quot;Registrar banda&quot;.
          </p>
        </div>
      )}
    </>
  );
}
