"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminEventosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin eventos error:", error);
  }, [error]);

  return (
    <div className="border-2 border-punk-red bg-punk-red/10 p-8">
      <h2 className="font-display text-xl text-punk-red">Error al cargar eventos</h2>
      <p className="mt-2 font-body text-punk-white/80">{error.message}</p>
      <div className="mt-6 flex gap-4">
        <button
          onClick={reset}
          className="border-2 border-punk-red bg-punk-red px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white"
        >
          Reintentar
        </button>
        <Link
          href="/admin"
          className="border-2 border-punk-white/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/70"
        >
          Volver al admin
        </Link>
      </div>
    </div>
  );
}
