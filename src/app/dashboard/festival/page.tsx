import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FestivalForm } from "./FestivalForm";
import { DashboardSection } from "@/components/dashboard/DashboardSection";

export default async function DashboardFestivalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const festival = await prisma.festival.findFirst({
    where: { userId: session.user.id },
  });

  const pendingClaim = !festival
    ? await prisma.profileClaim.findFirst({
        where: { userId: session.user.id, festivalId: { not: null }, status: "PENDING_CLAIM" },
        include: { festival: true },
      })
    : null;

  if (!festival) {
    return (
      <>
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            Mi festival
          </h1>
        </div>
        {pendingClaim?.festival ? (
          <div className="mt-6 border-2 border-punk-green/50 bg-punk-green/10 p-6">
            <p className="font-body text-punk-white/90">
              Pendiente de aprobación: has reclamado el perfil de &quot;{pendingClaim.festival.name}&quot;.
              El administrador está revisando tu solicitud. Recibirás un email cuando se apruebe.
            </p>
          </div>
        ) : (
          <p className="font-body text-punk-white/60">
            No tienes un festival asociado.
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          Mi festival
        </h1>
        <p className="mt-2 font-body text-punk-white/60">
          {festival.name}
          {!festival.approved && (
            <span className="ml-2 rounded border border-punk-red/50 bg-punk-red/10 px-2 py-0.5 font-punch text-xs text-punk-red">
              Pendiente de aprobación
            </span>
          )}
        </p>
      </div>
      <DashboardSection accent="red">
        <FestivalForm festival={festival} />
      </DashboardSection>
    </>
  );
}
