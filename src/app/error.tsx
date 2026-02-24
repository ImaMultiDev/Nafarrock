"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

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
        <h1 className="font-display text-5xl tracking-tighter text-punk-red sm:text-6xl">
          Algo ha fallado
        </h1>
        <p className="mt-4 font-body text-punk-white/80">
          Ha ocurrido un error inesperado. Puedes intentar de nuevo o volver al inicio.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 max-h-32 overflow-auto rounded border border-punk-red/30 bg-punk-black/80 p-4 font-mono text-xs text-punk-white/70">
            {error.message}
          </pre>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="border-2 border-punk-red bg-punk-red px-6 py-3 font-punch text-xs uppercase tracking-widest text-punk-white transition-colors hover:bg-transparent hover:text-punk-red"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="border-2 border-punk-white/30 px-6 py-3 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-colors hover:border-punk-white hover:text-punk-white"
          >
            Ir al inicio
          </Link>
          <Link
            href="/contacto"
            className="border-2 border-punk-green/50 px-6 py-3 font-punch text-xs uppercase tracking-widest text-punk-green transition-colors hover:bg-punk-green hover:text-punk-black"
          >
            Contactar
          </Link>
        </div>
      </div>
    </main>
  );
}
