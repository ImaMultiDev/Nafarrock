import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SalaForm } from "./SalaForm";
import { DashboardSection } from "@/components/dashboard/DashboardSection";

export default async function DashboardSalaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const isAdmin = session.user?.role === "ADMIN";

  const venue = isAdmin
    ? null
    : await prisma.venue.findFirst({
        where: { userId: session.user.id },
      });

  const nafarrockVenues =
    isAdmin
      ? await prisma.venue.findMany({
          where: { userId: null },
          orderBy: { name: "asc" },
        })
      : [];

  const pendingClaim = !venue
    ? await prisma.profileClaim.findFirst({
        where: { userId: session.user.id, venueId: { not: null }, status: "PENDING_CLAIM" },
        include: { venue: true },
      })
    : null;

  if (!venue) {
    return (
      <>
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            Mi sala
          </h1>
          {isAdmin && (
            <p className="mt-2 font-body text-punk-white/60">
              Salas creadas por Nafarrock (sin propietario, sujetas a reclamación)
            </p>
          )}
        </div>
        {isAdmin && nafarrockVenues.length > 0 ? (
          <DashboardSection accent="pink" title={`Salas Nafarrock (${nafarrockVenues.length})`}>
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
          </DashboardSection>
        ) : isAdmin ? (
          <p className="font-body text-punk-white/60">
            No hay salas creadas por Nafarrock. Créalas desde{" "}
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
            No tienes una sala asociada. Regístrate como sala para crear tu perfil.
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          Mi sala
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
