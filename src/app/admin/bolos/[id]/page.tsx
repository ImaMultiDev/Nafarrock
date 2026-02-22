import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageLayout } from "@/components/ui/PageLayout";

export default async function AdminBoloPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") notFound();

  const { id } = await params;
  const a = await prisma.announcement.findUnique({
    where: { id },
    include: {
      promoter: { select: { name: true, slug: true } },
      venue: { select: { name: true, slug: true } },
      festival: { select: { name: true, slug: true } },
      organizer: { select: { name: true, slug: true } },
    },
  });

  if (!a) notFound();

  const advertiserName = a.promoter?.name ?? a.venue?.name ?? a.festival?.name ?? a.organizer?.name ?? "";
  const advertiserType = a.promoter ? "Promotor" : a.venue ? "Sala" : a.festival ? "Festival" : "Organizador";

  return (
    <PageLayout>
      <Link
        href="/admin/bolos"
        className="font-punch text-xs uppercase tracking-widest text-punk-green hover:text-punk-green/80"
      >
        ← Volver a anuncios
      </Link>

      <div className="mt-8 border-l-4 border-punk-red bg-punk-black/50 p-6">
        <p className="font-punch text-xs uppercase tracking-widest text-punk-red">
          Vista previa (solo admin)
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-tighter text-punk-white">
          {a.title}
        </h1>
        <p className="mt-2 font-body text-punk-white/70">
          {advertiserType} · {advertiserName}
          {a.zone && ` · ${a.zone}`}
        </p>
        <p className="mt-1 font-body text-sm text-punk-white/50">
          {format(a.createdAt, "d MMM yyyy", { locale: es })} ·{" "}
          {a.isApproved ? "Activo" : "Pendiente"}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <h2 className="font-punch text-xs uppercase tracking-widest text-punk-white/70">
            Descripción
          </h2>
          <p className="mt-2 whitespace-pre-wrap font-body text-punk-white/90">
            {a.description}
          </p>
        </div>
        {a.contactEmail && (
          <p className="font-body text-punk-white/80">
            Contacto: {a.contactEmail}
          </p>
        )}
      </div>
    </PageLayout>
  );
}
