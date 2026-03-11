import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SalaForm } from "./SalaForm";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { Pagination } from "@/components/ui/Pagination";
import { getTranslations } from "next-intl/server";

const PAGE_SIZE = 12;

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function DashboardSalaPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");
  if ((session.user?.effectiveRole ?? session.user?.role) === "USUARIO") redirect("/dashboard");

  const isAdmin = session.user?.role === "ADMIN";
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const venue = isAdmin
    ? null
    : await prisma.venue.findFirst({
        where: { userId: session.user.id },
      });

  const nafarrockVenuesWhere = { userId: null };
  const [nafarrockVenues, nafarrockVenuesTotal] = isAdmin
    ? await Promise.all([
        prisma.venue.findMany({
          where: nafarrockVenuesWhere,
          orderBy: { name: "asc" },
          skip,
          take: PAGE_SIZE,
        }),
        prisma.venue.count({ where: nafarrockVenuesWhere }),
      ])
    : [[], 0];

  const pendingClaim = !venue
    ? await prisma.profileClaim.findFirst({
        where: { userId: session.user.id, venueId: { not: null }, status: "PENDING_CLAIM" },
        include: { venue: true },
      })
    : null;

  const t = await getTranslations("dashboard.cards");

  if (!venue) {
    return (
      <>
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            {t("myVenue")}
          </h1>
          {isAdmin && (
            <p className="mt-2 font-body text-punk-white/60">
              {t("nafarrockVenuesDesc")}
            </p>
          )}
        </div>
        {isAdmin && nafarrockVenues.length > 0 ? (
          <DashboardSection accent="pink" title={t("nafarrockVenuesTitle", { count: nafarrockVenuesTotal })}>
            <ul className="space-y-3">
              {nafarrockVenues.map((v) => (
                <li
                  key={v.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-punk-white/10 bg-punk-black/40 p-4"
                >
                  <div>
                    <Link href={`/salas/${v.slug}`} className="font-display text-lg text-punk-white hover:text-punk-pink">
                      {v.name}
                    </Link>
                    <span
                      className={`ml-2 px-2 py-0.5 font-punch text-xs uppercase ${
                        v.approved
                          ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                          : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                      }`}
                    >
                      {v.approved ? "Aprobado" : "Pendiente"}
                    </span>
                  </div>
                  <Link
                    href={`/admin/salas/${v.id}/editar`}
                    className="border-2 border-punk-white/30 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-white/80 hover:border-punk-pink hover:text-punk-pink"
                  >
                    Editar
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination page={page} totalItems={nafarrockVenuesTotal} pageSize={PAGE_SIZE} />
          </DashboardSection>
        ) : isAdmin ? (
          <p className="font-body text-punk-white/60">
            {t("noVenuesNafarrock")}{" "}
            <Link href="/admin/salas/nueva" className="text-punk-pink hover:underline">
              Administración
            </Link>
            .
          </p>
        ) : pendingClaim?.venue ? (
          <div className="rounded-xl border-2 border-punk-green/50 bg-punk-green/10 p-6">
            <p className="font-body text-punk-white/90">
              Pendiente de aprobación: has reclamado el perfil de &quot;{pendingClaim.venue.name}&quot;.
              El administrador está revisando tu solicitud. Recibirás un email cuando se apruebe.
            </p>
          </div>
        ) : (
          <p className="font-body text-punk-white/60">
            {t("noVenueAssociated")}
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          {t("myVenue")}
        </h1>
        <p className="mt-2 font-body text-punk-white/60">
          {venue.name}
          {!venue.approved && (
            <span className="ml-2 rounded border border-punk-red/50 bg-punk-red/10 px-2 py-0.5 font-punch text-xs text-punk-red">
              Pendiente de aprobación
            </span>
          )}
        </p>
      </div>
      <DashboardSection accent="pink">
        <SalaForm venue={venue} />
      </DashboardSection>
    </>
  );
}
