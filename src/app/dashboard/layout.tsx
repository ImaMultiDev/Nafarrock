import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { prisma } from "@/lib/prisma";
import { DashboardNav, type NavItem } from "@/components/dashboard/DashboardNav";
import { DashboardBackNav } from "@/components/dashboard/DashboardBackNav";

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

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Panel", icon: "dashboard", accent: "green" },
    { href: "/dashboard/perfil", label: "Mi perfil", icon: "perfil", accent: "pink" },
  ];

  if (role === "BANDA" || role === "ADMIN") {
    navItems.push({ href: "/dashboard/banda", label: "Mi banda", icon: "banda", accent: "green" });
  }
  if (role === "SALA" || role === "ADMIN") {
    navItems.push({ href: "/dashboard/sala", label: "Mi sala", icon: "sala", accent: "pink" });
  }
  if (role === "FESTIVAL" || role === "ADMIN") {
    navItems.push({ href: "/dashboard/festival", label: "Mi festival", icon: "festival", accent: "red" });
  }
  if (role === "ASOCIACION") {
    navItems.push({ href: "/dashboard/asociacion", label: "Mi asociación", icon: "asociacion", accent: "yellow" });
  }
  if (role === "PROMOTOR") {
    navItems.push({ href: "/dashboard/promotor", label: "Mi promotor", icon: "promotor", accent: "pink" });
  }
  if (role === "ORGANIZADOR") {
    navItems.push({ href: "/dashboard/organizador", label: "Mi organizador", icon: "organizador", accent: "yellow" });
  }
  if (
    ["SALA", "FESTIVAL", "ASOCIACION", "ORGANIZADOR", "PROMOTOR"].includes(role) ||
    (role === "ADMIN")
  ) {
    navItems.push({ href: "/dashboard/eventos", label: "Mis eventos", icon: "eventos", accent: "red" });
  }
  if (canPublishBolos) {
    navItems.push({ href: "/dashboard/bolos/nuevo", label: "Publicar anuncio", icon: "anuncio", accent: "green" });
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <DashboardNav items={navItems} />
        <div className="min-w-0 flex-1">
          <DashboardBackNav />
          <div className="rounded-xl border border-punk-white/5 bg-gradient-to-b from-punk-black/80 to-punk-black/40 p-6 shadow-inner sm:p-8 lg:p-10">
            {children}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
