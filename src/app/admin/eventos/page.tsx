import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { isValid } from "date-fns";
import { ApproveButton } from "@/components/admin/ApproveButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 20;

function safeFormatDate(d: Date): string {
  return isValid(d) ? format(d, "d MMM yyyy", { locale: es }) : "—";
}

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function AdminEventosPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      orderBy: { date: "asc" },
      take: PAGE_SIZE,
      skip,
      include: {
        venue: true,
        bands: { include: { band: true }, orderBy: { order: "asc" } },
      },
    }),
    prisma.event.count(),
  ]);

  const pending = events.filter((e) => !e.isApproved);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
            EVENTOS
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            {total} eventos de la agenda · {pending.length} pendientes de aprobar en esta página
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/eventos/nuevo"
            className="border-2 border-punk-red bg-punk-red px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white transition-all hover:bg-punk-blood"
          >
            Registrar evento
          </Link>
          <Link
            href="/admin/eventos/descubrir"
            className="border-2 border-punk-white/30 px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-red hover:text-punk-red"
          >
            Descubrir eventos
          </Link>
        </div>
      </div>

      <div className="mt-10 space-y-3">
        {events.map((e) => (
          <div
            key={e.id}
            className="flex flex-wrap items-center justify-between gap-4 border-2 border-punk-red/30 bg-punk-black p-4"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={`/eventos/${e.slug}`}
                className="font-display text-lg text-punk-white hover:text-punk-red"
              >
                {e.title}
              </Link>
              <p className="mt-1 font-body text-sm text-punk-white/60">
                {safeFormatDate(e.date)} · {e.venue?.name ?? "—"}
              </p>
              {e.bands.length > 0 && (
                <p className="mt-1 font-punch text-xs text-punk-green/80">
                  {e.bands.map((be) => be.band?.name ?? "—").filter(Boolean).join(" + ")}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2 py-1 font-punch text-xs uppercase ${
                  e.isApproved
                    ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                    : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                }`}
              >
                {e.isApproved ? "Aprobado" : "Pendiente"}
              </span>
              <ApproveButton entity="event" id={e.id} approved={e.isApproved} />
              <Link
                href={`/admin/eventos/${e.id}/editar`}
                className="border-2 border-punk-white/30 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:border-punk-red hover:text-punk-red"
              >
                Editar
              </Link>
              <DeleteButton entity="event" id={e.id} label="Borrar" />
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} totalItems={total} pageSize={PAGE_SIZE} />

      {events.length === 0 && (
        <div className="mt-12 border-2 border-dashed border-punk-white/20 p-12 text-center">
          <p className="font-body text-punk-white/60">
            No hay eventos. Crea uno con el botón &quot;Registrar evento&quot;.
          </p>
        </div>
      )}
    </>
  );
}
