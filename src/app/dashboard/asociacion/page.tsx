import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AsociacionForm } from "./AsociacionForm";
import { DashboardSection } from "@/components/dashboard/DashboardSection";

export default async function DashboardAsociacionPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");
  if ((session.user?.effectiveRole ?? session.user?.role) === "ADMIN") redirect("/dashboard");
  if ((session.user?.effectiveRole ?? session.user?.role) === "USUARIO") redirect("/dashboard");

  const association = await prisma.asociacion.findFirst({
    where: { userId: session.user.id },
  });

  const pendingClaim = !association
    ? await prisma.profileClaim.findFirst({
        where: { userId: session.user.id, associationId: { not: null }, status: "PENDING_CLAIM" },
        include: { association: true },
      })
    : null;

  if (!association) {
    return (
      <>
        <div className="mb-8">
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            Mi asociación
          </h1>
        </div>
        {pendingClaim?.association ? (
          <div className="rounded-xl border-2 border-punk-green/50 bg-punk-green/10 p-6">
            <p className="font-body text-punk-white/90">
              Pendiente de aprobación: has reclamado el perfil de &quot;{pendingClaim.association.name}&quot;.
              El administrador está revisando tu solicitud. Recibirás un email cuando se apruebe.
            </p>
          </div>
        ) : (
          <p className="font-body text-punk-white/60">
            No tienes una asociación o sociedad asociada.
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          Mi asociación
        </h1>
        <p className="mt-2 font-body text-punk-white/60">
          {association.name}
          {!association.approved && (
            <span className="ml-2 rounded border border-punk-red/50 bg-punk-red/10 px-2 py-0.5 font-punch text-xs text-punk-red">
              Pendiente de aprobación
            </span>
          )}
        </p>
      </div>
      <DashboardSection accent="yellow">
        <AsociacionForm association={association} />
      </DashboardSection>
    </>
  );
}
