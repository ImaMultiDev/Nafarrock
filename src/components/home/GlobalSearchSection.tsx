"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { canViewRestrictedEscena } from "@/lib/escena-visibility";
import { Search } from "lucide-react";

export function GlobalSearchSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { data: session } = useSession();
  const showRestricted = canViewRestrictedEscena(session ?? null);

  const searchHint = showRestricted
    ? "Bandas · Eventos · Salas · Festivales · Promotores · Organizadores"
    : "Bandas · Eventos · Salas · Festivales";

  const labelText = showRestricted
    ? "Buscar bandas, eventos, salas, festivales, promotores, organizadores"
    : "Buscar bandas, eventos, salas y festivales";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/buscar?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="relative z-10 px-6 pb-8 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} className="relative">
          <label htmlFor="global-search" className="sr-only">
            {labelText}
          </label>
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar bandas, eventos, salas, escena..."
            className="w-full border-2 border-punk-white/20 bg-punk-black/80 px-5 py-4 pl-12 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none"
          />
          <Search
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-punk-white/40"
            aria-hidden
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 border-2 border-punk-green bg-punk-green px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-black transition-colors hover:bg-transparent hover:text-punk-green"
          >
            Buscar
          </button>
        </form>
        <p className="mt-2 text-center font-body text-xs text-punk-white/50">
          {searchHint}
        </p>
      </div>
    </section>
  );
}
