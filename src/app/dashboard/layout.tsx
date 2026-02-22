import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { scheduledDeletionAt: true },
  });
  if (user?.scheduledDeletionAt) {
    if (user.scheduledDeletionAt < new Date()) {
      await prisma.user.delete({ where: { id: session.user.id } });
    }
    redirect("/auth/login?deleted=pending");
  }

  return (
    <PageLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="font-punch text-xs uppercase tracking-widest text-punk-green hover:text-punk-green/80"
        >
          Panel
        </Link>
        <div className="flex gap-4">
          <Link
            href="/dashboard/perfil"
            className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white"
          >
            Mi perfil
          </Link>
          <Link
            href="/dashboard/eventos"
            className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white"
          >
            Eventos
          </Link>
        </div>
      </div>
      {children}
    </PageLayout>
  );
}
