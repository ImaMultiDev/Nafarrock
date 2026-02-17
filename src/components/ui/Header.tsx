import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-50 border-b border-void-800 bg-void-950/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-xl font-bold text-void-50">
          NAFARROCK
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/bandas"
            className="text-sm text-void-300 hover:text-void-100"
          >
            Bandas
          </Link>
          <Link
            href="/eventos"
            className="text-sm text-void-300 hover:text-void-100"
          >
            Eventos
          </Link>
          <Link
            href="/salas"
            className="text-sm text-void-300 hover:text-void-100"
          >
            Salas
          </Link>
          <Link
            href="/buscar"
            className="text-sm text-void-300 hover:text-void-100"
          >
            Buscar
          </Link>
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-rock-600 px-4 py-2 text-sm font-medium text-white hover:bg-rock-500"
            >
              Panel
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-md bg-rock-600 px-4 py-2 text-sm font-medium text-white hover:bg-rock-500"
            >
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
