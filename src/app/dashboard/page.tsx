import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-void-50">
        Panel de usuario
      </h1>
      <p className="mt-2 text-void-400">
        Hola, {session.user?.name ?? session.user?.email}
          </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {session.user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="rounded-lg border border-rock-600/50 bg-rock-950/30 p-6 hover:border-rock-600"
          >
            <h2 className="font-display text-lg font-semibold text-rock-400">
              Administración
            </h2>
            <p className="mt-2 text-sm text-void-400">
              CRUD bandas, eventos, salas, usuarios
            </p>
          </Link>
        )}
        {(session.user?.role === "BANDA" || session.user?.role === "ADMIN") && (
          <Link
            href="/dashboard/banda"
            className="rounded-lg border border-void-800 p-6 hover:border-rock-600/50"
          >
            <h2 className="font-display text-lg font-semibold text-void-100">
              Mi banda
            </h2>
            <p className="mt-2 text-sm text-void-400">
              Editar perfil, enlaces, imágenes
            </p>
          </Link>
        )}
        {(session.user?.role === "PROMOTOR" || session.user?.role === "ADMIN") && (
          <Link
            href="/dashboard/eventos"
            className="rounded-lg border border-void-800 p-6 hover:border-rock-600/50"
          >
            <h2 className="font-display text-lg font-semibold text-void-100">
              Mis eventos
            </h2>
            <p className="mt-2 text-sm text-void-400">
              Crear y gestionar conciertos
            </p>
          </Link>
        )}
        {session.user?.role === "USUARIO" && (
          <p className="text-void-500">
            Explorando como usuario. Regístrate como banda o promotor para más opciones.
          </p>
        )}
      </div>
    </main>
  );
}
