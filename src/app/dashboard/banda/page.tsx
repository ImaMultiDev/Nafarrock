import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BandForm } from "./BandForm";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { Pagination } from "@/components/ui/Pagination";

const PAGE_SIZE = 12;
const GENRES = [
  "punk",
  "rock urbano",
  "grunge",
  "hardcore",
  "indie",
  "alternativo",
  "metal",
];

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function DashboardBandaPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");
  if ((session.user?.effectiveRole ?? session.user?.role) === "USUARIO") redirect("/dashboard");

  const isAdmin = session.user?.role === "ADMIN";
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const band = isAdmin
    ? null
    : await prisma.band.findFirst({
        where: { userId: session.user.id },
        include: { members: { orderBy: { order: "asc" } } },
      });

  const nafarrockBandsWhere = { userId: null };
  const [nafarrockBands, nafarrockBandsTotal] = isAdmin
    ? await Promise.all([
        prisma.band.findMany({
          where: nafarrockBandsWhere,
          orderBy: { name: "asc" },
          skip,
          take: PAGE_SIZE,
        }),
        prisma.band.count({ where: nafarrockBandsWhere }),
      ])
    : [[], 0];

  const pendingClaim = !band
    ? await prisma.profileClaim.findFirst({
        where: { userId: session.user.id, bandId: { not: null }, status: "PENDING_CLAIM" },
        include: { band: true },
      })
    : null;

  if (!band) {
    return (
      <>
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            Mi banda
          </h1>
          {isAdmin && (
            <p className="mt-2 font-body text-punk-white/60">
              Bandas creadas por Nafarrock (sin propietario, sujetas a reclamación)
            </p>
          )}
        </div>
        {isAdmin && nafarrockBands.length > 0 ? (
          <DashboardSection accent="green" title={`Bandas Nafarrock (${nafarrockBandsTotal})`}>
            <ul className="space-y-3">
              {nafarrockBands.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-punk-white/10 bg-punk-black/40 p-4"
                >
                  <div>
                    <Link href={`/bandas/${b.slug}`} className="font-display text-lg text-punk-white hover:text-punk-green">
                      {b.name}
                    </Link>
                    <span
                      className={`ml-2 px-2 py-0.5 font-punch text-xs uppercase ${
                        b.approved
                          ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                          : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                      }`}
                    >
                      {b.approved ? "Aprobado" : "Pendiente"}
                    </span>
                  </div>
                  <Link
                    href={`/admin/bandas/${b.id}/editar`}
                    className="border-2 border-punk-white/30 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-white/80 hover:border-punk-green hover:text-punk-green"
                  >
                    Editar
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination page={page} totalItems={nafarrockBandsTotal} pageSize={PAGE_SIZE} />
          </DashboardSection>
        ) : isAdmin ? (
          <p className="font-body text-punk-white/60">
            No hay bandas creadas por Nafarrock. Créalas desde{" "}
            <Link href="/admin/bandas/nueva" className="text-punk-green hover:underline">
              Administración
            </Link>
            .
          </p>
        ) : pendingClaim?.band ? (
          <div className="rounded-xl border-2 border-punk-green/50 bg-punk-green/10 p-6">
            <p className="font-body text-punk-white/90">
              Pendiente de aprobación: has reclamado el perfil de &quot;{pendingClaim.band.name}&quot;.
              El administrador está revisando tu solicitud. Recibirás un email cuando se apruebe.
            </p>
          </div>
        ) : (
          <p className="font-body text-punk-white/60">
            No tienes una banda asociada. Regístrate como banda para crear tu
            perfil.
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          Mi banda
        </h1>
        <p className="mt-2 font-body text-punk-white/60">
          {band.name}
          {!band.approved && (
            <span className="ml-2 rounded border border-punk-red/50 bg-punk-red/10 px-2 py-0.5 font-punch text-xs text-punk-red">
              Pendiente de aprobación
            </span>
          )}
        </p>
      </div>
      <DashboardSection accent="green">
        <BandForm band={band} genres={GENRES} />
      </DashboardSection>
    </>
  );
}
