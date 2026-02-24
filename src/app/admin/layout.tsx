import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { AdminBackNav } from "@/components/admin/AdminBackNav";
import { AdminPendingBanners } from "@/components/admin/AdminPendingBanners";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <PageLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <AdminBackNav />
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/solicitudes" className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white">Solicitudes</Link>
          <Link href="/admin/reclamaciones" className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white">Reclamaciones</Link>
          <Link href="/admin/bandas" className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white">Bandas</Link>
          <Link href="/admin/salas" className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white">Salas</Link>
          <Link href="/admin/eventos" className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white">Eventos</Link>
          <Link href="/admin/promotores" className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white">Promotores</Link>
          <Link href="/admin/organizadores" className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white">Organizadores</Link>
          <Link href="/admin/festivales" className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white">Festivales</Link>
          <Link href="/admin/asociaciones" className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white">Asociaciones</Link>
          <Link href="/admin/bolos" className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white">Anuncios</Link>
          <Link href="/admin/usuarios" className="font-punch text-xs uppercase tracking-widest text-punk-white/70 hover:text-punk-white">Usuarios</Link>
        </div>
      </div>
      <AdminPendingBanners />
      {children}
    </PageLayout>
  );
}
