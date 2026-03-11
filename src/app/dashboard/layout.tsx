import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageLayout } from "@/components/ui/PageLayout";
import { prisma } from "@/lib/prisma";
import { DashboardNav, type NavItem } from "@/components/dashboard/DashboardNav";
import { DashboardBackNav } from "@/components/dashboard/DashboardBackNav";
import { DashboardContentAnimator } from "@/components/dashboard/DashboardContentAnimator";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      scheduledDeletionAt: true,
      role: true,
      bandProfile: { select: { id: true } },
    },
  });
  if (user?.scheduledDeletionAt) {
    if (user.scheduledDeletionAt < new Date()) {
      await prisma.user.delete({ where: { id: session.user.id } });
    }
    redirect("/auth/login?deleted=pending");
  }

  const role = (session.user?.effectiveRole as string) ?? user?.role ?? "";
  const canPublishBolos = ["PROMOTOR", "SALA", "FESTIVAL", "ASOCIACION", "ORGANIZADOR"].includes(role);
  const t = await getTranslations("dashboard.cards");
  const tNav = await getTranslations("common.nav");

  const navItems: NavItem[] = [
    { href: "/dashboard", label: tNav("panel"), icon: "dashboard", accent: "green" },
    { href: "/dashboard/perfil", label: tNav("myProfile"), icon: "perfil", accent: "pink" },
    { href: "/dashboard/buzon", label: tNav("inbox"), icon: "buzon", accent: "yellow" },
  ];

  if (role === "BANDA" || role === "ADMIN") {
    navItems.push({ href: "/dashboard/banda", label: t("myBand"), icon: "banda", accent: "green" });
  }
  if (role === "SALA" || role === "ADMIN") {
    navItems.push({ href: "/dashboard/sala", label: t("myVenue"), icon: "sala", accent: "pink" });
  }
  if (role === "FESTIVAL" || role === "ADMIN") {
    navItems.push({ href: "/dashboard/festival", label: t("myFestival"), icon: "festival", accent: "red" });
  }
  if (role === "ASOCIACION") {
    navItems.push({ href: "/dashboard/asociacion", label: t("myAssociation"), icon: "asociacion", accent: "yellow" });
  }
  if (role === "PROMOTOR") {
    navItems.push({ href: "/dashboard/promotor", label: t("myPromoter"), icon: "promotor", accent: "pink" });
  }
  if (role === "ORGANIZADOR") {
    navItems.push({ href: "/dashboard/organizador", label: t("myOrganizer"), icon: "organizador", accent: "yellow" });
  }
  if (
    ["SALA", "FESTIVAL", "ASOCIACION", "ORGANIZADOR", "PROMOTOR"].includes(role) ||
    (role === "ADMIN")
  ) {
    navItems.push({ href: "/dashboard/eventos", label: t("myEvents"), icon: "eventos", accent: "red" });
  }
  if (canPublishBolos) {
    navItems.push({ href: "/dashboard/bolos/nuevo", label: t("publishAnnouncement"), icon: "anuncio", accent: "green" });
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <DashboardNav items={navItems} />
        <div className="min-w-0 flex-1">
          <DashboardBackNav />
          <DashboardContentAnimator>
            <div className="rounded-xl border border-punk-white/5 bg-gradient-to-b from-punk-black/80 to-punk-black/40 p-6 shadow-inner sm:p-8 lg:p-10">
              {children}
            </div>
          </DashboardContentAnimator>
        </div>
      </div>
    </PageLayout>
  );
}
