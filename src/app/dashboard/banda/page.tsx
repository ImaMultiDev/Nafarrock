import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BandForm } from "./BandForm";
import { DashboardSection } from "@/components/dashboard/DashboardSection";

const GENRES = [
  "punk",
  "rock urbano",
  "grunge",
  "hardcore",
  "indie",
  "alternativo",
  "metal",
];

export default async function DashboardBandaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const band = await prisma.band.findFirst({
    where: { userId: session.user.id },
    include: { members: { orderBy: { order: "asc" } } },
  });

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
        </div>
        {pendingClaim?.band ? (
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
