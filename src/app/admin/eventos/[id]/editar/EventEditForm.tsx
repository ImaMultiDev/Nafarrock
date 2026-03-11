"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { TranslateButton } from "@/components/admin/TranslateButton";
import { BandSelector } from "@/components/admin/BandSelector";
import { EventSocialLinksFields } from "@/components/admin/EventSocialLinksFields";
import { VenueFestivalSelect } from "@/components/admin/VenueFestivalSelect";

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
  descriptionEu: string | null;
  price: string | null;
  ticketUrl: string | null;
  imageUrl: string | null;
  images: string[];
  isApproved: boolean;
  eventLimitExempt: boolean;
  isSoldOut: boolean;
  venueId: string | null;
  venueText: string | null;
  festivalId: string | null;
  venue?: { name: string } | null;
  festival?: { name: string } | null;
  bands?: { bandId: string; band?: { id: string; name: string } }[];
  links?: { kind: string; url: string; label: string | null }[];
};

type Venue = { id: string; name: string };
type Festival = { id: string; name: string };
type Band = { id: string; name: string };

function getVenueOrFestivalDefault(event: Event): string {
  if (event.venueId) return `venue-${event.venueId}`;
  if (event.festivalId) return `festival-${event.festivalId}`;
  if (event.venueText) return "text";
  return "";
}

export function EventEditForm({ event, venues, festivals, bands }: { event: Event; venues: Venue[]; festivals: Festival[]; bands: Band[] }) {
  const initialBandIds = (event.bands ?? []).map((be) => be.bandId);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bandIds, setBandIds] = useState<string[]>(initialBandIds);
  const [description, setDescription] = useState(event.description ?? "");
  const [descriptionEu, setDescriptionEu] = useState(event.descriptionEu ?? "");
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const date = new Date(formData.get("date") as string);
    const endDateVal = formData.get("endDate") as string;
    const endDate = isMultiDay && endDateVal ? new Date(endDateVal).toISOString() : null;
    if (isMultiDay && endDateVal && new Date(endDateVal) < date) {
      setError("La fecha de fin debe ser posterior a la de inicio");
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/admin/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        type: formData.get("type"),
        date: date.toISOString(),
        endDate,
        doorsOpen: formData.get("doorsOpen") || null,
        venueOrFestival: formData.get("venueOrFestival") || null,
        venueText: formData.get("venueText") || null,
        description: description || null,
        descriptionEu: descriptionEu || null,
        price: formData.get("price") || null,
        ticketUrl: formData.get("ticketUrl") || null,
        links: links.filter((l) => l.url?.trim()).map((l) => ({ kind: l.kind, url: l.url.trim(), label: l.label || "" })),
        imageUrl: imageUrl || null,
        images,
        bandIds,
        isSoldOut: (formData.get("isSoldOut") as string) === "on",
        isApproved: (formData.get("approved") as string) === "on",
        eventLimitExempt: (formData.get("eventLimitExempt") as string) === "on",
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
        <ImageUpload folder="events" type="logo" entityId={event.id} value={imageUrl} onChange={setImageUrl} onRemove={() => setImageUrl("")} label="Imagen principal (opcional)" />
      </div>
      <div>
        <ImageGallery folder="events" entityId={event.id} images={images} onChange={setImages} label="Imágenes adicionales (opcionales, máx. 2)" maxImages={2} />
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
      <div>
        <label className={labelClass}>Duración del evento</label>
        <div className="mt-2 flex gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="duration"
              checked={!isMultiDay}
              onChange={() => setIsMultiDay(false)}
              className="accent-punk-red"
            />
            <span className="font-body text-punk-white/90">Un día</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="duration"
              checked={isMultiDay}
              onChange={() => setIsMultiDay(true)}
              className="accent-punk-red"
            />
            <span className="font-body text-punk-white/90">Varios días</span>
          </label>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={labelClass}>
            {isMultiDay ? "Fecha de inicio *" : "Fecha y hora *"}
          </label>
          <input id="date" name="date" type="datetime-local" required defaultValue={dateStr} min={new Date().toISOString().slice(0, 16)} className={inputClass} />
        </div>
        {isMultiDay ? (
          <div>
            <label htmlFor="endDate" className={labelClass}>
              Fecha de fin *
            </label>
            <input id="endDate" name="endDate" type="datetime-local" required={isMultiDay} defaultValue={endDateStr} min={new Date().toISOString().slice(0, 16)} className={inputClass} />
          </div>
        ) : (
          <div>
            <label htmlFor="doorsOpen" className={labelClass}>
              Puertas
            </label>
            <input id="doorsOpen" name="doorsOpen" type="text" defaultValue={event.doorsOpen ?? ""} className={inputClass} />
          </div>
        )}
      </div>
      {isMultiDay && (
        <div>
          <label htmlFor="doorsOpen" className={labelClass}>
            Puertas (opcional)
          </label>
          <input id="doorsOpen" name="doorsOpen" type="text" defaultValue={event.doorsOpen ?? ""} className={inputClass} placeholder="18:00 cada día" />
        </div>
      )}
      <VenueFestivalSelect
        venues={venues}
        festivals={festivals}
        defaultValue={getVenueOrFestivalDefault(event)}
        defaultVenueText={event.venueText ?? ""}
      />
      <BandSelector bands={bands} value={bandIds} onChange={setBandIds} />
      <div>
        <label htmlFor="description" className={labelClass}>
          Descripción
        </label>
        <textarea id="description" name="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="descriptionEu" className={labelClass}>
          Descripción (Euskera)
        </label>
        <div className="mt-2 flex flex-wrap items-start gap-2">
          <textarea id="descriptionEu" name="descriptionEu" rows={3} value={descriptionEu} onChange={(e) => setDescriptionEu(e.target.value)} className={inputClass} placeholder="Traducción al euskera batua" />
          <TranslateButton sourceText={description} onTranslated={setDescriptionEu} />
        </div>
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
      <EventSocialLinksFields
        defaultWebsiteUrl={event.websiteUrl ?? ""}
        defaultInstagramUrl={event.instagramUrl ?? ""}
        defaultFacebookUrl={event.facebookUrl ?? ""}
      />
      <label className="flex cursor-pointer items-center gap-2">
        <input type="checkbox" name="isSoldOut" defaultChecked={event.isSoldOut} className="accent-punk-red" />
        <span className={labelClass}>Entradas agotadas (SOLD OUT)</span>
      </label>
      <div className="flex flex-wrap gap-6">
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" name="approved" defaultChecked={event.isApproved} className="accent-punk-green" />
          <span className={labelClass}>Aprobado</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" name="eventLimitExempt" defaultChecked={event.eventLimitExempt} className="accent-punk-green" />
          <span className={labelClass}>Exento de límite 5 días</span>
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
