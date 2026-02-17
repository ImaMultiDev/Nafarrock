import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";

export default async function DashboardEventosLayout({
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
          ← Panel
        </Link>
      </div>
      {children}
    </PageLayout>
  );
}
