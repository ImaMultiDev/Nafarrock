import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-void-950">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-void-800">
        <div className="absolute inset-0 bg-gradient-to-b from-rock-950/50 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <h1 className="font-display text-5xl font-bold tracking-tight text-void-50 sm:text-7xl">
            NAFARROCK
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-void-300">
            La guía del punk rock, rock urbano y escena alternativa navarra.
            Bandas, festivales, conciertos y salas. Memoria cultural y escena
            viva.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/bandas"
              className="rounded-md bg-rock-600 px-6 py-3 font-medium text-white hover:bg-rock-500 transition-colors"
            >
              Explorar bandas
            </Link>
            <Link
              href="/eventos"
              className="rounded-md border border-void-600 px-6 py-3 font-medium text-void-200 hover:bg-void-900 transition-colors"
            >
              Ver eventos
            </Link>
            <Link
              href="/salas"
              className="rounded-md border border-void-600 px-6 py-3 font-medium text-void-200 hover:bg-void-900 transition-colors"
            >
              Salas y espacios
            </Link>
          </div>
        </div>
      </header>

      {/* Quick links */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/bandas"
            className="group rounded-lg border border-void-800 bg-void-900/50 p-6 transition hover:border-rock-600/50"
          >
            <h2 className="font-display text-xl font-semibold text-void-100 group-hover:text-rock-400">
              Bandas
            </h2>
            <p className="mt-2 text-sm text-void-400">
              Históricas y emergentes de Navarra
            </p>
          </Link>
          <Link
            href="/eventos"
            className="group rounded-lg border border-void-800 bg-void-900/50 p-6 transition hover:border-rock-600/50"
          >
            <h2 className="font-display text-xl font-semibold text-void-100 group-hover:text-rock-400">
              Conciertos
            </h2>
            <p className="mt-2 text-sm text-void-400">
              Próximos eventos y festivales
            </p>
          </Link>
          <Link
            href="/salas"
            className="group rounded-lg border border-void-800 bg-void-900/50 p-6 transition hover:border-rock-600/50"
          >
            <h2 className="font-display text-xl font-semibold text-void-100 group-hover:text-rock-400">
              Salas
            </h2>
            <p className="mt-2 text-sm text-void-400">
              Espacios de la escena navarra
            </p>
          </Link>
          <Link
            href="/buscar"
            className="group rounded-lg border border-void-800 bg-void-900/50 p-6 transition hover:border-rock-600/50"
          >
            <h2 className="font-display text-xl font-semibold text-void-100 group-hover:text-rock-400">
              Buscar
            </h2>
            <p className="mt-2 text-sm text-void-400">
              Por género, localidad, activo...
            </p>
          </Link>
        </div>
      </section>

      {/* Footer placeholder */}
      <footer className="border-t border-void-800 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-void-500">
          Nafarrock — Plataforma de la escena rock navarra
        </div>
      </footer>
    </main>
  );
}
