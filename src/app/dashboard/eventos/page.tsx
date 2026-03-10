import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canUserCreateEvent } from "@/lib/validated-event";
import { DashboardEventForm } from "./DashboardEventForm";
import { DeleteEventButton } from "@/components/dashboard/DeleteEventButton";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const PAGE_SIZE = 12;

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function DashboardEventosPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");
  const effectiveRole = session.user?.effectiveRole ?? session.user?.role;
  if (effectiveRole === "USUARIO") redirect("/dashboard");

  const check = await canUserCreateEvent(session.user.id, new Date());
  const canCreate = check.ok;

  const isAdmin = session.user?.role === "ADMIN";
  const eventFilter = isAdmin
    ? { createdByUserId: null }
    : { createdByUserId: session.user.id };

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [venues, festivals, bands, myEvents, myEventsTotal] = await Promise.all([
    prisma.venue.findMany({
      orderBy: { name: "asc" },
      where: { approved: true },
    }),
    prisma.festival.findMany({
      orderBy: { name: "asc" },
      where: { approved: true },
    }),
    prisma.band.findMany({
      orderBy: { name: "asc" },
      where: { approved: true },
    }),
    prisma.event.findMany({
      where: eventFilter,
      orderBy: { date: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        venue: true,
        festival: true,
        bands: { include: { band: true }, orderBy: { order: "asc" } },
      },
    }),
    prisma.event.count({ where: eventFilter }),
  ]);

  const userWithProfiles = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { venueProfile: true, festivalProfile: true },
  });
  const userVenue = userWithProfiles?.role === "SALA" && userWithProfiles?.venueProfile?.approved
    ? userWithProfiles.venueProfile
    : null;
  const userFestival = userWithProfiles?.role === "FESTIVAL" && userWithProfiles?.festivalProfile?.approved
    ? userWithProfiles.festivalProfile
    : null;

  const venuesForForm = userVenue
    ? venues.filter((v) => v.id === userVenue.id)
    : venues;

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          Mis eventos
        </h1>
        <p className="mt-2 font-body text-punk-white/60">
          {isAdmin
            ? "Eventos creados por Nafarrock (sin propietario)."
            : canCreate
              ? "Crea eventos y espera la aprobación del administrador."
              : !check.ok
                ? check.message
                : "Listado de tus eventos."}
        </p>
      </div>

      {canCreate && !isAdmin && (
        <DashboardSection title="Crear evento" accent="red">
          <DashboardEventForm
            venues={venuesForForm}
            festivals={festivals}
            bands={bands}
            defaultVenueId={userVenue?.id}
            defaultFestivalId={userFestival?.id}
          />
        </DashboardSection>
      )}

      <DashboardSection
        title={isAdmin ? `Eventos Nafarrock (${myEventsTotal})` : `Tus eventos (${myEventsTotal})`}
        accent="red"
      >
        <div className="space-y-3">
          {myEvents.map((e) => (
            <div
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-punk-white/10 bg-punk-black/40 p-4 transition-colors hover:border-punk-white/20"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/eventos/${e.slug}`}
                  className="font-display text-lg text-punk-white hover:text-punk-pink"
                >
                  {e.title}
                </Link>
                <p className="mt-1 font-body text-sm text-punk-white/60">
                  {format(e.date, "d MMM yyyy", { locale: es })} · {e.venue?.name ?? e.festival?.name ?? "—"}
                </p>
                {e.bands.length > 0 && (
                  <p className="mt-1 font-punch text-xs text-punk-green/80">
                    {e.bands.map((be) => be.band.name).join(" + ")}
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
                <Link
                  href={`/dashboard/eventos/${e.id}/editar`}
                  className="border-2 border-punk-white/30 bg-punk-white/5 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-colors hover:border-punk-green hover:text-punk-green"
                >
                  Editar
                </Link>
                <DeleteEventButton eventId={e.id} />
              </div>
            </div>
          ))}
        </div>
        <Pagination page={page} totalItems={myEventsTotal} pageSize={PAGE_SIZE} />
        {myEvents.length === 0 && (
          <p className="py-8 font-body text-center text-punk-white/50">
            {isAdmin
              ? "No hay eventos creados por Nafarrock. Créalos desde Administración."
              : "No has creado ningún evento aún."}
          </p>
        )}
      </DashboardSection>
    </>
  );
}
