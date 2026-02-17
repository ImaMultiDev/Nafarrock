"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Venue = { id: string; name: string };
type Band = { id: string; name: string };

export function EventForm({ venues, bands }: { venues: Venue[]; bands: Band[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const bandIds = formData.getAll("bandIds") as string[];

    const dateStr = formData.get("date") as string;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      setError("Fecha inválida");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        type: formData.get("type"),
        date: date.toISOString(),
        endDate: formData.get("endDate")
          ? new Date(formData.get("endDate") as string).toISOString()
          : undefined,
        venueId: formData.get("venueId"),
        doorsOpen: formData.get("doorsOpen") || undefined,
        description: formData.get("description") || undefined,
        price: formData.get("price") || undefined,
        ticketUrl: formData.get("ticketUrl") || undefined,
        bandIds: bandIds.filter(Boolean),
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Error al crear");
      return;
    }
    router.push("/admin/eventos");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 max-w-2xl space-y-6">
      {error && (
        <div className="border-2 border-punk-red bg-punk-red/10 p-4">
          <p className="font-body text-punk-red">{error}</p>
        </div>
      )}
      <div>
        <label htmlFor="title" className={labelClass}>
          Título *
        </label>
        <input id="title" name="title" type="text" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="type" className={labelClass}>
          Tipo
        </label>
        <select id="type" name="type" className={inputClass}>
          <option value="CONCIERTO">Concierto</option>
          <option value="FESTIVAL">Festival</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={labelClass}>
            Fecha *
          </label>
          <input id="date" name="date" type="datetime-local" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="doorsOpen" className={labelClass}>
            Puertas
          </label>
          <input id="doorsOpen" name="doorsOpen" type="text" className={inputClass} placeholder="20:00" />
        </div>
      </div>
      <div>
        <label htmlFor="venueId" className={labelClass}>
          Sala *
        </label>
        <select id="venueId" name="venueId" required className={inputClass}>
          <option value="">Selecciona sala</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        {venues.length === 0 && (
          <p className="mt-2 font-body text-sm text-punk-red">
            No hay salas aprobadas. Crea una primero.
          </p>
        )}
      </div>
      <div>
        <label className={labelClass}>
          Bandas (opcional)
        </label>
        <div className="mt-2 max-h-40 overflow-y-auto space-y-2 border-2 border-punk-white/20 p-4">
          {bands.map((b) => (
            <label key={b.id} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" name="bandIds" value={b.id} className="accent-punk-red" />
              <span className="font-body text-punk-white/80">{b.name}</span>
            </label>
          ))}
          {bands.length === 0 && (
            <p className="font-body text-sm text-punk-white/50">No hay bandas aprobadas</p>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>
          Descripción
        </label>
        <textarea id="description" name="description" rows={3} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={labelClass}>
            Precio
          </label>
          <input id="price" name="price" type="text" className={inputClass} placeholder="10€ / Entrada libre" />
        </div>
        <div>
          <label htmlFor="ticketUrl" className={labelClass}>
            URL entradas
          </label>
          <input id="ticketUrl" name="ticketUrl" type="url" className={inputClass} />
        </div>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || venues.length === 0}
          className="border-2 border-punk-red bg-punk-red px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-white transition-all hover:bg-punk-blood disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear evento"}
        </button>
        <a
          href="/admin/eventos"
          className="border-2 border-punk-white/30 px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
