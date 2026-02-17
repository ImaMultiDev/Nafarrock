"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Event = {
  id: string;
  title: string;
  type: string;
  date: Date;
  endDate: Date | null;
  doorsOpen: string | null;
  description: string | null;
  price: string | null;
  ticketUrl: string | null;
  isApproved: boolean;
  venueId: string;
};

type Venue = { id: string; name: string };
export function EventEditForm({
  event,
  venues,
}: {
  event: Event;
  venues: Venue[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateLocal = new Date(event.date);
  dateLocal.setMinutes(dateLocal.getMinutes() - dateLocal.getTimezoneOffset());
  const dateStr = dateLocal.toISOString().slice(0, 16);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const date = new Date(formData.get("date") as string);
    const res = await fetch(`/api/admin/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        type: formData.get("type"),
        date: date.toISOString(),
        doorsOpen: formData.get("doorsOpen") || null,
        venueId: formData.get("venueId"),
        description: formData.get("description") || null,
        price: formData.get("price") || null,
        ticketUrl: formData.get("ticketUrl") || null,
        isApproved: (formData.get("approved") as string) === "on",
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Error al actualizar");
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
        <input id="title" name="title" type="text" required defaultValue={event.title} className={inputClass} />
      </div>
      <div>
        <label htmlFor="type" className={labelClass}>
          Tipo
        </label>
        <select id="type" name="type" defaultValue={event.type} className={inputClass}>
          <option value="CONCIERTO">Concierto</option>
          <option value="FESTIVAL">Festival</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={labelClass}>
            Fecha *
          </label>
          <input id="date" name="date" type="datetime-local" required defaultValue={dateStr} className={inputClass} />
        </div>
        <div>
          <label htmlFor="doorsOpen" className={labelClass}>
            Puertas
          </label>
          <input id="doorsOpen" name="doorsOpen" type="text" defaultValue={event.doorsOpen ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="venueId" className={labelClass}>
          Sala *
        </label>
        <select id="venueId" name="venueId" required defaultValue={event.venueId} className={inputClass}>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>
          Descripción
        </label>
        <textarea id="description" name="description" rows={3} defaultValue={event.description ?? ""} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={labelClass}>
            Precio
          </label>
          <input id="price" name="price" type="text" defaultValue={event.price ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="ticketUrl" className={labelClass}>
            URL entradas
          </label>
          <input id="ticketUrl" name="ticketUrl" type="url" defaultValue={event.ticketUrl ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" name="approved" defaultChecked={event.isApproved} className="accent-punk-green" />
          <span className={labelClass}>Aprobado</span>
        </label>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="border-2 border-punk-red bg-punk-red px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-white transition-all hover:bg-punk-blood disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <a href="/admin/eventos" className="border-2 border-punk-white/30 px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white">
          Cancelar
        </a>
      </div>
    </form>
  );
}
