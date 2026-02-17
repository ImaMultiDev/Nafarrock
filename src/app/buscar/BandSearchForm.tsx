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
    <form onSubmit={handleSubmit} className="mt-8 rounded-lg border border-void-800 bg-void-900/50 p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="search" className="block text-sm text-void-400">
            Búsqueda por texto
          </label>
          <input
            id="search"
            name="search"
            type="text"
            defaultValue={defaultSearch}
            placeholder="Nombre de banda..."
            className="mt-1 w-full rounded border border-void-700 bg-void-900 px-3 py-2 text-void-100 placeholder:text-void-500 focus:border-rock-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="genre" className="block text-sm text-void-400">
            Género
          </label>
          <select
            id="genre"
            name="genre"
            defaultValue={defaultGenre}
            className="mt-1 w-full rounded border border-void-700 bg-void-900 px-3 py-2 text-void-100 focus:border-rock-500 focus:outline-none"
          >
            <option value="">Todos</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="location" className="block text-sm text-void-400">
            Localidad
          </label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={defaultLocation}
            placeholder="Pamplona, Tudela..."
            className="mt-1 w-full rounded border border-void-700 bg-void-900 px-3 py-2 text-void-100 placeholder:text-void-500 focus:border-rock-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="block text-sm text-void-400">Filtros</label>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="active"
                value=""
                defaultChecked={!defaultActive}
                className="rounded border-void-600"
              />
              <span className="text-sm text-void-400">Todo</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="active"
                value="true"
                defaultChecked={defaultActive === "true"}
                className="rounded border-void-600"
              />
              <span className="text-sm text-void-400">Activas</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="active"
                value="false"
                defaultChecked={defaultActive === "false"}
                className="rounded border-void-600"
              />
              <span className="text-sm text-void-400">Inactivas</span>
            </label>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="emerging"
              value="true"
              defaultChecked={defaultEmerging === "true"}
              className="rounded border-void-600"
            />
            <span className="text-sm text-void-400">Solo emergentes</span>
          </label>
        </div>
      </div>
      <div className="mt-4">
        <button
          type="submit"
          className="rounded bg-rock-600 px-6 py-2 font-medium text-white hover:bg-rock-500 transition-colors"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
