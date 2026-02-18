"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const GENRES = ["punk", "rock urbano", "grunge", "hardcore", "indie", "alternativo", "metal"];

export function BandasFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const params = new URLSearchParams();
      params.set("search", (formData.get("search") as string) || "");
      params.set("genre", (formData.get("genre") as string) || "");
      params.set("location", (formData.get("location") as string) || "");
      const emerging = (form.querySelector('input[name="emerging"]') as HTMLInputElement)?.checked;
      if (emerging) params.set("emerging", "1");
      router.push(`/bandas?${params.toString()}`);
    },
    [router]
  );

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex flex-wrap items-end gap-4 border-b-2 border-punk-green/30 pb-6">
      <div className="min-w-[180px] flex-1">
        <label htmlFor="bandas-search" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          Buscar
        </label>
        <input
          id="bandas-search"
          name="search"
          type="text"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Nombre, género..."
          className="mt-1 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="bandas-genre" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          Género
        </label>
        <select
          id="bandas-genre"
          name="genre"
          defaultValue={searchParams.get("genre") ?? ""}
          className="mt-1 border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white focus:border-punk-green focus:outline-none"
        >
          <option value="">Todos</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="bandas-location" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          Localidad
        </label>
        <input
          id="bandas-location"
          name="location"
          type="text"
          defaultValue={searchParams.get("location") ?? ""}
          placeholder="Pamplona..."
          className="mt-1 w-32 border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none"
        />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="emerging" defaultChecked={searchParams.get("emerging") === "1"} className="accent-punk-green" />
        <span className="font-body text-sm text-punk-white/80">Emergentes</span>
      </label>
      <button type="submit" className="border-2 border-punk-green bg-punk-green px-6 py-2 font-punch text-xs uppercase tracking-widest text-punk-black hover:bg-transparent hover:text-punk-green transition-colors">
        Filtrar
      </button>
    </form>
  );
}
