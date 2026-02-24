import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-punk-black">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,200,83,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,83,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(230,0,38,0.08)_0%,transparent_50%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="font-display text-8xl tracking-tighter text-punk-red sm:text-9xl">
          404
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tighter text-punk-white sm:text-4xl">
          Página no encontrada
        </h1>
        <p className="mt-4 font-body text-punk-white/70">
          La página que buscas no existe o ha sido movida.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="border-2 border-punk-red bg-punk-red px-6 py-3 font-punch text-xs uppercase tracking-widest text-punk-white transition-colors hover:bg-transparent hover:text-punk-red"
          >
            Ir al inicio
          </Link>
          <Link
            href="/eventos"
            className="border-2 border-punk-white/30 px-6 py-3 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-colors hover:border-punk-white hover:text-punk-white"
          >
            Ver eventos
          </Link>
          <Link
            href="/bandas"
            className="border-2 border-punk-white/30 px-6 py-3 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-colors hover:border-punk-white hover:text-punk-white"
          >
            Ver bandas
          </Link>
        </div>
      </div>
    </main>
  );
}
