import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

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
