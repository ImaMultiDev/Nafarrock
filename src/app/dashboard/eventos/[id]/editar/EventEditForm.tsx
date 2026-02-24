"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageGallery } from "@/components/ui/ImageGallery";

const inputClass = "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
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
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  webUrl: string | null;
  imageUrl: string | null;
  images: string[];
  isSoldOut: boolean;
  venueId: string | null;
  bands: { band: { id: string } }[];
};
type Venue = { id: string; name: string };
type Band = { id: string; name: string };

export function EventEditForm({
  event,
  venues,
  bands,
}: {
  event: Event;
  venues: Venue[];
  bands: Band[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(event.imageUrl ?? "");
  const [images, setImages] = useState<string[]>(event.images ?? []);
  const [isMultiDay, setIsMultiDay] = useState(!!event.endDate);

  const dateLocal = new Date(event.date);
  dateLocal.setMinutes(dateLocal.getMinutes() - dateLocal.getTimezoneOffset());
  const dateStr = dateLocal.toISOString().slice(0, 16);

  const endDateLocal = event.endDate ? new Date(event.endDate) : null;
  const endDateStr = endDateLocal
    ? (() => {
        const d = new Date(endDateLocal);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
      })()
    : "";

  const bandIds = event.bands.map((be) => be.band.id);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const selectedBandIds = formData.getAll("bandIds") as string[];
    const date = new Date(formData.get("date") as string);
    const endDateVal = formData.get("endDate") as string;
    const endDate = isMultiDay && endDateVal ? new Date(endDateVal).toISOString() : null;
    if (isMultiDay && endDateVal && new Date(endDateVal) < date) {
      setError("La fecha de fin debe ser posterior a la de inicio");
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/dashboard/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        type: formData.get("type"),
        date: date.toISOString(),
        endDate,
        venueId: formData.get("venueId"),
        doorsOpen: formData.get("doorsOpen") || null,
        description: formData.get("description") || null,
        price: formData.get("price") || null,
        ticketUrl: formData.get("ticketUrl") || null,
        instagramUrl: formData.get("instagramUrl") || null,
        facebookUrl: formData.get("facebookUrl") || null,
        twitterUrl: formData.get("twitterUrl") || null,
        webUrl: formData.get("webUrl") || null,
        imageUrl: imageUrl || null,
        images: images,
        isSoldOut: (formData.get("isSoldOut") as string) === "on",
        bandIds: selectedBandIds.filter(Boolean),
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Error al actualizar");
      return;
    }
    router.push("/dashboard/eventos");
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
        <label htmlFor="title" className={labelClass}>Título *</label>
        <input id="title" name="title" type="text" required defaultValue={event.title} className={inputClass} />
      </div>
      <div>
        <ImageUpload folder="events" type="logo" entityId={event.id} value={imageUrl} onChange={setImageUrl} onRemove={() => setImageUrl("")} label="Imagen principal (opcional)" />
      </div>
      <div>
        <ImageGallery folder="events" entityId={event.id} images={images} onChange={setImages} label="Imágenes adicionales (opcionales, máx. 2)" maxImages={2} />
      </div>
      <div>
        <label htmlFor="type" className={labelClass}>Tipo</label>
        <select id="type" name="type" defaultValue={event.type} className={inputClass}>
          <option value="CONCIERTO">Concierto</option>
          <option value="FESTIVAL">Festival</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Duración del evento</label>
        <div className="mt-2 flex gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="duration" checked={!isMultiDay} onChange={() => setIsMultiDay(false)} className="accent-punk-red" />
            <span className="font-body text-punk-white/90">Un día</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="duration" checked={isMultiDay} onChange={() => setIsMultiDay(true)} className="accent-punk-red" />
            <span className="font-body text-punk-white/90">Varios días</span>
          </label>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={labelClass}>{isMultiDay ? "Fecha de inicio *" : "Fecha y hora *"}</label>
          <input id="date" name="date" type="datetime-local" required defaultValue={dateStr} min={new Date().toISOString().slice(0, 16)} className={inputClass} />
        </div>
        {isMultiDay ? (
          <div>
            <label htmlFor="endDate" className={labelClass}>Fecha de fin *</label>
            <input id="endDate" name="endDate" type="datetime-local" required={isMultiDay} defaultValue={endDateStr} min={new Date().toISOString().slice(0, 16)} className={inputClass} />
          </div>
        ) : (
          <div>
            <label htmlFor="doorsOpen" className={labelClass}>Puertas</label>
            <input id="doorsOpen" name="doorsOpen" type="text" defaultValue={event.doorsOpen ?? ""} className={inputClass} placeholder="20:00" />
          </div>
        )}
      </div>
      {isMultiDay && (
        <div>
          <label htmlFor="doorsOpen" className={labelClass}>Puertas (opcional)</label>
          <input id="doorsOpen" name="doorsOpen" type="text" defaultValue={event.doorsOpen ?? ""} className={inputClass} placeholder="18:00 cada día" />
        </div>
      )}
      <div>
        <label htmlFor="venueId" className={labelClass}>Sala (opcional)</label>
        <select id="venueId" name="venueId" defaultValue={event.venueId ?? ""} className={inputClass}>
          <option value="">Sin sala / Por confirmar</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Bandas (opcional)</label>
        <div className="mt-2 max-h-40 space-y-2 overflow-y-auto border-2 border-punk-white/20 p-4">
          {bands.map((b) => (
            <label key={b.id} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" name="bandIds" value={b.id} defaultChecked={bandIds.includes(b.id)} className="accent-punk-red" />
              <span className="font-body text-punk-white/80">{b.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>Descripción</label>
        <textarea id="description" name="description" rows={3} defaultValue={event.description ?? ""} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={labelClass}>Precio</label>
          <input id="price" name="price" type="text" defaultValue={event.price ?? ""} className={inputClass} placeholder="10€ / Entrada libre" />
        </div>
        <div>
          <label htmlFor="ticketUrl" className={labelClass}>URL entradas</label>
          <input id="ticketUrl" name="ticketUrl" type="url" defaultValue={event.ticketUrl ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Redes y enlaces (opcional)</label>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <input id="instagramUrl" name="instagramUrl" type="url" defaultValue={event.instagramUrl ?? ""} className={inputClass} placeholder="Instagram" />
          <input id="facebookUrl" name="facebookUrl" type="url" defaultValue={event.facebookUrl ?? ""} className={inputClass} placeholder="Facebook" />
          <input id="twitterUrl" name="twitterUrl" type="url" defaultValue={event.twitterUrl ?? ""} className={inputClass} placeholder="X (Twitter)" />
          <input id="webUrl" name="webUrl" type="url" defaultValue={event.webUrl ?? ""} className={inputClass} placeholder="Web del evento" />
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2">
        <input type="checkbox" name="isSoldOut" defaultChecked={event.isSoldOut} className="accent-punk-red" />
        <span className={labelClass}>Entradas agotadas (SOLD OUT)</span>
      </label>
      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="border-2 border-punk-pink bg-punk-pink px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black hover:bg-punk-pink/90 disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <a href="/dashboard/eventos" className="border-2 border-punk-white/30 px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white">
          Cancelar
        </a>
      </div>
    </form>
  );
}
