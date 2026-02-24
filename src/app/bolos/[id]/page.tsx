import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { getAnnouncementById } from "@/services/announcement.service";
import { AnnouncementDetail } from "./AnnouncementDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = await getAnnouncementById(id);
  if (!a) return {};
  return {
    title: `${a.title} | Buscar bolos`,
    description: a.description.slice(0, 160),
  };
}

export default async function AnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const effectiveRole = session?.user?.effectiveRole ?? session?.user?.role;
  const isAdmin = session?.user?.role === "ADMIN";
  const canSeeBolos = effectiveRole === "BANDA" || isAdmin;
  if (!canSeeBolos) redirect("/bolos");

  const announcement = await getAnnouncementById(id);
  if (!announcement) notFound();

  return (
    <PageLayout>
      <Link
        href="/bolos"
        className="font-punch text-xs uppercase tracking-widest text-punk-green hover:text-punk-green/80"
      >
        ← Volver a buscar bolos
      </Link>

      <AnnouncementDetail announcement={announcement} />
    </PageLayout>
  );
}
