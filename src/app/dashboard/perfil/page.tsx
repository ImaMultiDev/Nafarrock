import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { DeleteAccountSection } from "./DeleteAccountSection";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { PerfilHeader } from "@/components/dashboard/PerfilHeader";

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

  const entityTypeKey = user.bandProfile
    ? "band"
    : user.venueProfile
      ? "venue"
      : user.festivalProfile
        ? "festival"
        : user.associationProfile
          ? "association"
          : user.organizerProfile
            ? "organizer"
            : user.promoterProfile
              ? "promoter"
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

  const t = await getTranslations("dashboard.perfil");

  return (
    <>
      <PerfilHeader />

      <div className="space-y-8">
        <DashboardSection title="Datos personales" accent="pink">
          <ProfileForm
            firstName={user.firstName ?? ""}
            lastName={user.lastName ?? ""}
            email={user.email}
          />
        </DashboardSection>

        {entity && (
          <DashboardSection title={t("approvalStatus")} accent="pink">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-punk-white/10 bg-punk-black/40 p-6">
              <div>
                <p className="font-punch text-xs uppercase tracking-widest text-punk-white/60">
                  {entityTypeKey ? t(`entityType.${entityTypeKey}`) : ""}
                </p>
                <p className="mt-1 font-display text-xl text-punk-white">
                  {"name" in entity ? entity.name : t("noName")}
                </p>
                <span
                  className={`mt-2 inline-block px-2 py-1 font-punch text-xs uppercase ${
                    "approved" in entity && entity.approved
                      ? "border border-punk-green/50 bg-punk-green/10 text-punk-green"
                      : "border border-punk-red/50 bg-punk-red/10 text-punk-red"
                  }`}
                >
                  {"approved" in entity && entity.approved
                    ? t("approvedFem")
                    : t("pendingApproval")}
                </span>
              </div>
              {entityEditLink && (
                <Link
                  href={entityEditLink}
                  className="border-2 border-punk-pink bg-punk-pink px-6 py-2 font-punch text-sm uppercase tracking-widest text-punk-black transition-colors hover:bg-punk-pink/90"
                >
                  {t("edit")} {entityTypeKey ? t(`entityType.${entityTypeKey}`).toLowerCase() : ""}
                </Link>
              )}
            </div>
          </DashboardSection>
        )}

        {!entity && session.user?.role !== "USUARIO" && (
          <p className="font-body text-punk-white/60">
            {t("noEntityHint", { role: session.user?.role?.toLowerCase() ?? "" })}
          </p>
        )}

        <DashboardSection title={t("changePassword")} accent="pink">
          <ChangePasswordForm hasPassword={!!user.password} />
        </DashboardSection>

        <DashboardSection title={t("dangerZone")} accent="red">
          <p className="mb-4 font-body text-punk-white/60">
            {t("deleteAccountHint")}
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
