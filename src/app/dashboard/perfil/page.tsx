import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { DeleteAccountSection } from "./DeleteAccountSection";
import { DashboardSection } from "@/components/dashboard/DashboardSection";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      bandProfile: true,
      venueProfile: true,
      festivalProfile: true,
      associationProfile: true,
      organizerProfile: true,
      promoterProfile: true,
    },
  });

  if (!user) redirect("/auth/login");

  const entity =
    user.bandProfile ??
    user.venueProfile ??
    user.festivalProfile ??
    user.associationProfile ??
    user.organizerProfile ??
    user.promoterProfile;

  const entityType = user.bandProfile
    ? "Banda"
    : user.venueProfile
      ? "Sala"
      : user.festivalProfile
        ? "Festival"
        : user.associationProfile
          ? "Asociación"
          : user.organizerProfile
            ? "Organizador"
            : user.promoterProfile
              ? "Promotor"
              : null;

  const entityEditLink = user.bandProfile
    ? "/dashboard/banda"
    : user.venueProfile
      ? "/dashboard/sala"
      : user.festivalProfile
        ? "/dashboard/festival"
        : user.associationProfile
          ? "/dashboard/asociacion"
          : user.organizerProfile
            ? "/dashboard/organizador"
            : user.promoterProfile
              ? "/dashboard/promotor"
              : null;

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          Mi perfil
        </h1>
        <p className="mt-2 font-body text-punk-white/60">
          Gestiona tus datos personales y el estado de tu entidad
        </p>
      </div>

      <div className="space-y-8">
        <DashboardSection title="Datos personales" accent="pink">
          <ProfileForm
            firstName={user.firstName ?? ""}
            lastName={user.lastName ?? ""}
            email={user.email}
          />
        </DashboardSection>

        {entity && (
          <DashboardSection title="Estado de aprobación" accent="pink">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-punk-white/10 bg-punk-black/40 p-6">
              <div>
                <p className="font-punch text-xs uppercase tracking-widest text-punk-white/60">
                  {entityType}
                </p>
                <p className="mt-1 font-display text-xl text-punk-white">
                  {"name" in entity ? entity.name : "Sin nombre"}
                </p>
                <span
                  className={`mt-2 inline-block px-2 py-1 font-punch text-xs uppercase ${
                    "approved" in entity && entity.approved
                      ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                      : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                  }`}
                >
                  {"approved" in entity && entity.approved
                    ? "Aprobada"
                    : "Pendiente de aprobación"}
                </span>
              </div>
              {entityEditLink && (
                <Link
                  href={entityEditLink}
                  className="border-2 border-punk-pink bg-punk-pink px-6 py-2 font-punch text-sm uppercase tracking-widest text-punk-black transition-colors hover:bg-punk-pink/90"
                >
                  Editar {entityType?.toLowerCase()}
                </Link>
              )}
            </div>
          </DashboardSection>
        )}

        {!entity && session.user?.role !== "USUARIO" && (
          <p className="font-body text-punk-white/60">
            Regístrate como {session.user?.role?.toLowerCase()} para crear tu
            entidad y ver el estado de aprobación.
          </p>
        )}

        <DashboardSection title="Cambiar contraseña" accent="pink">
          <ChangePasswordForm hasPassword={!!user.password} />
        </DashboardSection>

        <DashboardSection title="Zona de riesgo" accent="red">
          <p className="mb-4 font-body text-punk-white/60">
            Borrar tu cuenta eliminará todos tus datos de forma permanente.
          </p>
          <DeleteAccountSection
            hasPassword={!!user.password}
            isAdmin={user.role === "ADMIN"}
          />
        </DashboardSection>
      </div>
    </>
  );
}
