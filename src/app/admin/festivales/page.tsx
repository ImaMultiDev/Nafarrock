import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ApproveButton } from "@/components/admin/ApproveButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 20;

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminFestivalesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [festivals, total] = await Promise.all([
    prisma.festival.findMany({
      orderBy: { name: "asc" },
      include: { user: { select: { email: true } } },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.festival.count(),
  ]);

  const pending = festivals.filter((f) => !f.approved);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            FESTIVALES
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            {total} festivales · {pending.length} pendientes de aprobar en esta página
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
                  <div className="flex flex-wrap items-center gap-2">
                    <ApproveButton entity="festival" id={f.id} approved={f.approved} />
                    <DeleteButton entity="festival" id={f.id} label="Borrar" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalItems={total} pageSize={PAGE_SIZE} />
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
