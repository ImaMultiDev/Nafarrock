import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-void-50">
        Panel de administración
      </h1>
      <p className="mt-2 text-void-400">
        CRUD completo, moderación y aprobación
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/bandas"
          className="rounded-lg border border-void-800 bg-void-900/50 p-6 hover:border-rock-600/50"
        >
          <h2 className="font-display text-lg font-semibold text-void-100">
            Bandas
          </h2>
          <p className="mt-2 text-sm text-void-400">
            Gestionar y aprobar bandas
          </p>
        </Link>
        <Link
          href="/admin/eventos"
          className="rounded-lg border border-void-800 bg-void-900/50 p-6 hover:border-rock-600/50"
        >
          <h2 className="font-display text-lg font-semibold text-void-100">
            Eventos
          </h2>
          <p className="mt-2 text-sm text-void-400">
            Conciertos y festivales
          </p>
        </Link>
        <Link
          href="/admin/salas"
          className="rounded-lg border border-void-800 bg-void-900/50 p-6 hover:border-rock-600/50"
        >
          <h2 className="font-display text-lg font-semibold text-void-100">
            Salas
          </h2>
          <p className="mt-2 text-sm text-void-400">
            Espacios y venues
          </p>
        </Link>
        <Link
          href="/admin/usuarios"
          className="rounded-lg border border-void-800 bg-void-900/50 p-6 hover:border-rock-600/50"
        >
          <h2 className="font-display text-lg font-semibold text-void-100">
            Usuarios
          </h2>
          <p className="mt-2 text-sm text-void-400">
            Promotores, bandas, roles
          </p>
        </Link>
      </div>
    </main>
  );
}
