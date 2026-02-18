"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function SalasFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const params = new URLSearchParams();
      params.set("search", (formData.get("search") as string) || "");
      params.set("city", (formData.get("city") as string) || "");
      params.set("capacityMin", (formData.get("capacityMin") as string) || "");
      params.set("capacityMax", (formData.get("capacityMax") as string) || "");
      router.push(`/salas?${params.toString()}`);
    },
    [router]
  );

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex flex-wrap items-end gap-4 border-b-2 border-punk-pink/30 pb-6">
      <div className="min-w-[180px] flex-1">
        <label htmlFor="salas-search" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          Buscar
        </label>
        <input
          id="salas-search"
          name="search"
          type="text"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Nombre, ciudad..."
          className="mt-1 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-pink focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="salas-city" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          Ciudad
        </label>
        <input
          id="salas-city"
          name="city"
          type="text"
          defaultValue={searchParams.get("city") ?? ""}
          placeholder="Pamplona..."
          className="mt-1 border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-pink focus:outline-none min-w-[120px]"
        />
      </div>
      <div>
        <label htmlFor="salas-cap-min" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          Aforo mín.
        </label>
        <input
          id="salas-cap-min"
          name="capacityMin"
          type="number"
          min={1}
          defaultValue={searchParams.get("capacityMin") ?? ""}
          placeholder="100"
          className="mt-1 w-24 border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-pink focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="salas-cap-max" className="block font-punch text-xs uppercase tracking-widest text-punk-white/70">
          Aforo máx.
        </label>
        <input
          id="salas-cap-max"
          name="capacityMax"
          type="number"
          min={1}
          defaultValue={searchParams.get("capacityMax") ?? ""}
          placeholder="500"
          className="mt-1 w-24 border-2 border-punk-white/20 bg-punk-black px-4 py-2 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-pink focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="border-2 border-punk-pink bg-punk-pink px-6 py-2 font-punch text-xs uppercase tracking-widest text-punk-black hover:bg-transparent hover:text-punk-pink transition-colors"
      >
        Filtrar
      </button>
    </form>
  );
}
