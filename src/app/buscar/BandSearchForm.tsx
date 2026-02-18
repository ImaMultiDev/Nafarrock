"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const GENRES = ["punk", "rock urbano", "grunge", "hardcore", "indie", "alternativo", "metal"];

type Props = {
  defaultSearch?: string;
  defaultGenre?: string;
  defaultLocation?: string;
  defaultActive?: string;
  defaultEmerging?: string;
};

export default function BandSearchForm({
  defaultSearch = "",
  defaultGenre = "",
  defaultLocation = "",
  defaultActive = "",
  defaultEmerging = "",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const emerging = (form.querySelector('input[name="emerging"]') as HTMLInputElement)?.checked;
      const params = new URLSearchParams(searchParams);
      params.set("search", (formData.get("search") as string) || "");
      params.set("genre", (formData.get("genre") as string) || "");
      params.set("location", (formData.get("location") as string) || "");
      params.set("active", (formData.get("active") as string) || "");
      params.set("emerging", emerging ? "true" : "");
      router.push(`/buscar?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="relative border-2 border-punk-acid bg-punk-black p-6 sm:p-8"
    >
      <div className="absolute right-0 top-0 h-12 w-12 border-t-2 border-r-2 border-punk-acid" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
      <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="search" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
            Búsqueda por texto
          </label>
          <input
            id="search"
            name="search"
            type="text"
            defaultValue={defaultSearch}
            placeholder="Bandas, eventos, salas, escena..."
            className="mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-acid focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="genre" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
            Género
          </label>
          <select
            id="genre"
            name="genre"
            defaultValue={defaultGenre}
            className="mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white focus:border-punk-acid focus:outline-none"
          >
            <option value="">Todos</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="location" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
            Localidad
          </label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={defaultLocation}
            placeholder="Pamplona, Tudela..."
            className="mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-acid focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
            Filtros
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="active"
                value=""
                defaultChecked={!defaultActive}
                className="accent-punk-acid"
              />
              <span className="font-body text-sm text-punk-white/70">Todo</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="active"
                value="true"
                defaultChecked={defaultActive === "true"}
                className="accent-punk-acid"
              />
              <span className="font-body text-sm text-punk-white/70">Activas</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="active"
                value="false"
                defaultChecked={defaultActive === "false"}
                className="accent-punk-acid"
              />
              <span className="font-body text-sm text-punk-white/70">Inactivas</span>
            </label>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="emerging"
              value="true"
              defaultChecked={defaultEmerging === "true"}
              className="accent-punk-acid"
            />
            <span className="font-body text-sm text-punk-white/70">Solo emergentes</span>
          </label>
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="border-2 border-punk-acid bg-punk-acid px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-acid/90 hover:shadow-[0_0_30px_rgba(200,255,0,0.3)]"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
