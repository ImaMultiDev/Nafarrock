"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { TranslateButton } from "@/components/admin/TranslateButton";
import { BandSelector } from "@/components/admin/BandSelector";
import { EventLinksBuilder, type EventLinkItem } from "@/components/admin/EventLinksBuilder";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Festival = { id: string; name: string };
type Band = { id: string; name: string };

export function EventForm({ festivals, bands }: { festivals: Festival[]; bands: Band[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [bandIds, setBandIds] = useState<string[]>([]);
  const [links, setLinks] = useState<EventLinkItem[]>([]);
  const [descriptionEu, setDescriptionEu] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();

  const applyAutofillData = (data: Record<string, unknown>) => {
    const form = formRef.current;
    if (data.title) {
      const el = form?.querySelector<HTMLInputElement>('[name="title"]');
      if (el) el.value = data.title as string;
    }
    if (data.description) setDescription(data.description as string);
    if (data.imageUrl) setImageUrl(data.imageUrl as string);
    if (data.date) {
      const el = form?.querySelector<HTMLInputElement>('[name="date"]');
      if (el) el.value = data.date as string;
    }
    if (data.endDate) {
      setIsMultiDay(true);
      const el = form?.querySelector<HTMLInputElement>('[name="endDate"]');
      if (el) el.value = data.endDate as string;
    }
    if (data.venueText) {
      const el = form?.querySelector<HTMLInputElement>('[name="venueText"]');
      if (el) el.value = data.venueText as string;
    }
    if (data.price) {
      const el = form?.querySelector<HTMLInputElement>('[name="price"]');
      if (el) el.value = data.price as string;
    }
    if (data.ticketUrl) {
      const el = form?.querySelector<HTMLInputElement>('[name="ticketUrl"]');
      if (el) el.value = data.ticketUrl as string;
    }
    if (data.webUrl) {
      setLinks([{ kind: "web", url: data.webUrl as string, label: "Web del evento" }]);
    }
  };

  useEffect(() => {
    const autofillUrl = searchParams.get("autofillUrl");
    if (!autofillUrl) return;

    const run = async () => {
      const urlInput = formRef.current?.querySelector<HTMLInputElement>('[name="eventUrl"]');
      if (urlInput) urlInput.value = autofillUrl;

      setError(null);
      setAutofillLoading(true);
      try {
        const res = await fetch("/api/admin/event-autofill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: autofillUrl }),
        });
        const json = await res.json();

        if (!res.ok) {
          setError(json.message ?? "Error al buscar");
          return;
        }

        const data = json.data;
        if (!data) {
          setError(json.message ?? "No se encontró información");
          return;
        }

        applyAutofillData(data);
      } catch {
        setError("Error de conexión al buscar información");
      } finally {
        setAutofillLoading(false);
      }
    };

    run();
    router.replace("/admin/eventos/nuevo", { scroll: false });
  }, [searchParams, router]);

  const handleAutofill = async () => {
    const urlInput = formRef.current?.querySelector<HTMLInputElement>('[name="eventUrl"]');
    const url = urlInput?.value?.trim();
    if (!url) {
      setError("Pega la URL del evento antes de buscar");
      return;
    }

    setError(null);
    setAutofillLoading(true);
    try {
      const res = await fetch("/api/admin/event-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.message ?? "Error al buscar");
        return;
      }

      const data = json.data;
      if (data) applyAutofillData(data);
      else setError(json.message ?? "No se encontró información");
    } catch {
      setError("Error de conexión al buscar información");
    } finally {
      setAutofillLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const dateStr = formData.get("date") as string;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      setError("Fecha inválida");
      setLoading(false);
      return;
    }

    const endDateStr = formData.get("endDate") as string;
    let endDate: string | undefined;
    if (isMultiDay && endDateStr) {
      const end = new Date(endDateStr);
      if (isNaN(end.getTime()) || end < date) {
        setError("La fecha de fin debe ser posterior a la de inicio");
        setLoading(false);
        return;
      }
      endDate = end.toISOString();
    }

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        type: formData.get("type"),
        date: date.toISOString(),
        endDate,
        venueText: formData.get("venueText") || undefined,
        festivalId: formData.get("festivalId") || undefined,
        doorsOpen: formData.get("doorsOpen") || undefined,
        description: formData.get("description") || undefined,
        price: formData.get("price") || undefined,
        ticketUrl: formData.get("ticketUrl") || undefined,
        links: links.filter((l) => l.url?.trim()).map((l) => ({ kind: l.kind, url: l.url.trim(), label: l.label || "" })),
        imageUrl: imageUrl || undefined,
        images,
        isSoldOut: (formData.get("isSoldOut") as string) === "on",
        bandIds,
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
    <form ref={formRef} onSubmit={handleSubmit} className="mt-10 max-w-2xl space-y-6">
      {error && (
        <div className="border-2 border-punk-red bg-punk-red/10 p-4">
          <p className="font-body text-punk-red">{error}</p>
        </div>
      )}
      <div>
        <label htmlFor="eventUrl" className={labelClass}>
          URL del evento (autofill)
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            id="eventUrl"
            name="eventUrl"
            type="url"
            className={`${inputClass} flex-1 min-w-[200px]`}
            placeholder="https://www.eventbrite.com/e/... o https://www.ticketmaster.com/..."
          />
          <button
            type="button"
            onClick={handleAutofill}
            disabled={autofillLoading}
            className="shrink-0 border-2 border-punk-white/30 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:border-punk-red hover:text-punk-red disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {autofillLoading ? "Buscando…" : "Buscar información automáticamente"}
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="title" className={labelClass}>
          Título *
        </label>
        <input id="title" name="title" type="text" required className={inputClass} />
      </div>
      <div>
        <ImageUpload folder="events" type="logo" entityId={null} value={imageUrl} onChange={setImageUrl} onRemove={() => setImageUrl("")} label="Imagen principal (opcional)" />
      </div>
      <div>
        <ImageGallery folder="events" entityId="new" images={images} onChange={setImages} label="Imágenes adicionales (opcionales, máx. 2)" maxImages={2} />
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
          <input
            id="date"
            name="date"
            type="datetime-local"
            required
            min={new Date().toISOString().slice(0, 16)}
            className={inputClass}
          />
        </div>
        {isMultiDay ? (
          <div>
            <label htmlFor="endDate" className={labelClass}>
              Fecha de fin *
            </label>
            <input
              id="endDate"
              name="endDate"
              type="datetime-local"
              required={isMultiDay}
              min={new Date().toISOString().slice(0, 16)}
              className={inputClass}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="doorsOpen" className={labelClass}>
              Puertas
            </label>
            <input id="doorsOpen" name="doorsOpen" type="text" className={inputClass} placeholder="20:00" />
          </div>
        )}
      </div>
      {isMultiDay && (
        <div>
          <label htmlFor="doorsOpen" className={labelClass}>
            Puertas (opcional)
          </label>
          <input id="doorsOpen" name="doorsOpen" type="text" className={inputClass} placeholder="18:00 cada día" />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="venueText" className={labelClass}>
            Sala / Recinto (opcional)
          </label>
          <input
            id="venueText"
            name="venueText"
            type="text"
            className={inputClass}
            placeholder="Ej: Plaza de toros de Pamplona, Polideportivo..."
          />
        </div>
        <div>
          <label htmlFor="festivalId" className={labelClass}>
            Festival (opcional)
          </label>
          <select id="festivalId" name="festivalId" className={inputClass}>
            <option value="">Ninguno</option>
            {festivals.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <p className="mt-1 font-body text-xs text-punk-white/50">
            Si el evento forma parte de un festival, selecciónalo.
          </p>
        </div>
      </div>
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
          <input id="price" name="price" type="text" className={inputClass} placeholder="10€ / Entrada libre" />
        </div>
        <div>
          <label htmlFor="ticketUrl" className={labelClass}>
            URL entradas
          </label>
          <input id="ticketUrl" name="ticketUrl" type="url" className={inputClass} />
        </div>
      </div>
      <EventLinksBuilder value={links} onChange={setLinks} />
      <label className="flex cursor-pointer items-center gap-2">
        <input type="checkbox" name="isSoldOut" className="accent-punk-red" />
        <span className={labelClass}>Entradas agotadas (SOLD OUT)</span>
      </label>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
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
