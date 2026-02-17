import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <>
      <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
        PANEL
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        Hola, {session.user?.name ?? session.user?.email}
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/perfil"
          className="border-2 border-punk-white/20 bg-punk-black/50 p-6 transition-colors hover:border-punk-pink hover:bg-punk-black/80"
        >
          <h2 className="font-display text-lg font-semibold text-punk-white">
            Mi perfil
          </h2>
          <p className="mt-2 text-sm text-punk-white/60">
            Datos personales y estado de aprobación
          </p>
        </Link>
        {session.user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="border-2 border-punk-green/50 bg-punk-green/10 p-6 transition-colors hover:border-punk-green"
          >
            <h2 className="font-display text-lg font-semibold text-punk-green">
              Administración
            </h2>
            <p className="mt-2 text-sm text-punk-white/60">
              CRUD bandas, eventos, salas, usuarios
            </p>
          </Link>
        )}
        {(session.user?.role === "BANDA" || session.user?.role === "ADMIN") && (
          <Link
            href="/dashboard/banda"
            className="border-2 border-punk-white/20 bg-punk-black/50 p-6 transition-colors hover:border-punk-pink hover:bg-punk-black/80"
          >
            <h2 className="font-display text-lg font-semibold text-punk-white">
              Mi banda
            </h2>
            <p className="mt-2 text-sm text-punk-white/60">
              Editar perfil, logo, enlaces
            </p>
          </Link>
        )}
        {(session.user?.role === "SALA" || session.user?.role === "ADMIN") && (
          <Link
            href="/dashboard/sala"
            className="border-2 border-punk-white/20 bg-punk-black/50 p-6 transition-colors hover:border-punk-pink hover:bg-punk-black/80"
          >
            <h2 className="font-display text-lg font-semibold text-punk-white">
              Mi sala
            </h2>
            <p className="mt-2 text-sm text-punk-white/60">
              Editar perfil, logo, redes
            </p>
          </Link>
        )}
        {(session.user?.role === "SALA" ||
          session.user?.role === "FESTIVAL" ||
          session.user?.role === "ORGANIZADOR" ||
          session.user?.role === "PROMOTOR" ||
          session.user?.role === "ADMIN") && (
          <Link
            href="/dashboard/eventos"
            className="border-2 border-punk-white/20 bg-punk-black/50 p-6 transition-colors hover:border-punk-pink hover:bg-punk-black/80"
          >
            <h2 className="font-display text-lg font-semibold text-punk-white">
              Mis eventos
            </h2>
            <p className="mt-2 text-sm text-punk-white/60">
              Crear y gestionar conciertos
            </p>
          </Link>
        )}
        {session.user?.role === "USUARIO" && (
          <p className="font-body text-punk-white/50">
            Regístrate como banda, sala o promotor para más opciones.
          </p>
        )}
      </div>
    </>
  );
}
