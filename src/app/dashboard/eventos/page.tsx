import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canUserCreateEvent } from "@/lib/validated-event";
import { DashboardEventForm } from "./DashboardEventForm";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardEventosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const check = await canUserCreateEvent(session.user.id, new Date());
  const canCreate = check.ok;

  const [venues, bands, myEvents] = await Promise.all([
    prisma.venue.findMany({
      orderBy: { name: "asc" },
      where: { approved: true },
    }),
    prisma.band.findMany({
      orderBy: { name: "asc" },
      where: { approved: true },
    }),
    prisma.event.findMany({
      where: { createdByUserId: session.user.id },
      orderBy: { date: "desc" },
      include: {
        venue: true,
        bands: { include: { band: true }, orderBy: { order: "asc" } },
      },
    }),
  ]);

  const userVenue = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { venueProfile: true },
  }).then((u) => (u?.role === "SALA" && u?.venueProfile?.approved ? u.venueProfile : null));

  const venuesForForm = userVenue
    ? venues.filter((v) => v.id === userVenue.id)
    : venues;

  return (
    <>
      <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
        MIS EVENTOS
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        {canCreate
          ? "Crea eventos y espera la aprobación del administrador."
          : !check.ok
            ? check.message
            : "Listado de tus eventos."}
      </p>

      {canCreate && (
        <div className="mt-10">
          <h2 className="font-display text-2xl text-punk-pink">
            Crear evento
          </h2>
          <DashboardEventForm
            venues={venuesForForm}
            bands={bands}
            defaultVenueId={userVenue?.id}
          />
        </div>
      )}

      <div className="mt-16">
        <h2 className="font-display text-2xl text-punk-white">
          Tus eventos ({myEvents.length})
        </h2>
        <div className="mt-6 space-y-3">
          {myEvents.map((e) => (
            <div
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-4 border-2 border-punk-white/10 bg-punk-black/50 p-4"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/eventos/${e.slug}`}
                  className="font-display text-lg text-punk-white hover:text-punk-pink"
                >
                  {e.title}
                </Link>
                <p className="mt-1 font-body text-sm text-punk-white/60">
                  {format(e.date, "d MMM yyyy", { locale: es })} · {e.venue.name}
                </p>
                {e.bands.length > 0 && (
                  <p className="mt-1 font-punch text-xs text-punk-green/80">
                    {e.bands.map((be) => be.band.name).join(" + ")}
                  </p>
                )}
              </div>
              <span
                className={`px-2 py-1 font-punch text-xs uppercase ${
                  e.isApproved
                    ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                    : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                }`}
              >
                {e.isApproved ? "Aprobado" : "Pendiente"}
              </span>
            </div>
          ))}
        </div>
        {myEvents.length === 0 && (
          <p className="mt-6 font-body text-punk-white/50">
            No has creado ningún evento aún.
          </p>
        )}
      </div>
    </>
  );
}
