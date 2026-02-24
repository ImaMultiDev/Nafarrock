import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FestivalForm } from "./FestivalForm";
import { DashboardSection } from "@/components/dashboard/DashboardSection";

export default async function DashboardFestivalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const isAdmin = session.user?.role === "ADMIN";

  const festival = isAdmin
    ? null
    : await prisma.festival.findFirst({
        where: { userId: session.user.id },
      });

  const nafarrockFestivals =
    isAdmin
      ? await prisma.festival.findMany({
          where: { userId: null },
          orderBy: { name: "asc" },
        })
      : [];

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
          {isAdmin && (
            <p className="mt-2 font-body text-punk-white/60">
              Festivales creados por Nafarrock (sin propietario, sujetos a reclamación)
            </p>
          )}
        </div>
        {isAdmin && nafarrockFestivals.length > 0 ? (
          <DashboardSection accent="red" title={`Festivales Nafarrock (${nafarrockFestivals.length})`}>
            <ul className="space-y-3">
              {nafarrockFestivals.map((f) => (
                <li
                  key={f.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-punk-white/10 bg-punk-black/40 p-4"
                >
                  <div>
                    <Link href={`/festivales/${f.slug}`} className="font-display text-lg text-punk-white hover:text-punk-red">
                      {f.name}
                    </Link>
                    <span
                      className={`ml-2 px-2 py-0.5 font-punch text-xs uppercase ${
                        f.approved
                          ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                          : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                      }`}
                    >
                      {f.approved ? "Aprobado" : "Pendiente"}
                    </span>
                  </div>
                  <Link
                    href="/admin/festivales"
                    className="border-2 border-punk-white/30 px-3 py-1 font-punch text-xs uppercase tracking-widest text-punk-white/80 hover:border-punk-red hover:text-punk-red"
                  >
                    Gestionar
                  </Link>
                </li>
              ))}
            </ul>
          </DashboardSection>
        ) : isAdmin ? (
          <p className="font-body text-punk-white/60">
            No hay festivales creados por Nafarrock. Créalos desde{" "}
            <Link href="/admin/festivales/nueva" className="text-punk-red hover:underline">
              Administración
            </Link>
            .
          </p>
        ) : pendingClaim?.festival ? (
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
