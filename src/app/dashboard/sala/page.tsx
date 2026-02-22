import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SalaForm } from "./SalaForm";

export default async function DashboardSalaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const venue = await prisma.venue.findFirst({
    where: { userId: session.user.id },
  });

  const pendingClaim = !venue
    ? await prisma.profileClaim.findFirst({
        where: { userId: session.user.id, venueId: { not: null }, status: "PENDING_CLAIM" },
        include: { venue: true },
      })
    : null;

  if (!venue) {
    return (
      <div>
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          MI SALA
        </h1>
        {pendingClaim?.venue ? (
          <div className="mt-6 border-2 border-punk-green/50 bg-punk-green/10 p-6">
            <p className="font-body text-punk-white/90">
              Pendiente de aprobación: has reclamado el perfil de &quot;{pendingClaim.venue.name}&quot;.
              El administrador está revisando tu solicitud. Recibirás un email cuando se apruebe.
            </p>
          </div>
        ) : (
          <p className="mt-6 font-body text-punk-white/60">
            No tienes una sala asociada. Regístrate como sala para crear tu perfil.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
        MI SALA
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        {venue.name}
        {!venue.approved && (
          <span className="ml-2 rounded border border-punk-red/50 bg-punk-red/10 px-2 py-0.5 font-punch text-xs text-punk-red">
            Pendiente de aprobación
          </span>
        )}
      </p>
      <SalaForm venue={venue} />
    </>
  );
}
