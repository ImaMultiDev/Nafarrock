"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageGallery } from "@/components/ui/ImageGallery";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Venue = { id: string; name: string };
type Band = { id: string; name: string };

export function DashboardEventForm({
  venues,
  bands,
  defaultVenueId,
}: {
  venues: Venue[];
  bands: Band[];
  defaultVenueId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isMultiDay, setIsMultiDay] = useState(false);

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

    const res = await fetch("/api/dashboard/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        type: formData.get("type"),
        date: date.toISOString(),
        endDate,
        venueId: formData.get("venueId"),
        doorsOpen: formData.get("doorsOpen") || undefined,
        description: formData.get("description") || undefined,
        price: formData.get("price") || undefined,
        ticketUrl: formData.get("ticketUrl") || undefined,
        instagramUrl: formData.get("instagramUrl") || undefined,
        facebookUrl: formData.get("facebookUrl") || undefined,
        twitterUrl: formData.get("twitterUrl") || undefined,
        webUrl: formData.get("webUrl") || undefined,
        imageUrl: imageUrl || undefined,
        images: images,
        isSoldOut: (formData.get("isSoldOut") as string) === "on",
        bandIds: bandIds.filter(Boolean),
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Error al crear");
      return;
    }
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
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
        <ImageUpload
          folder="events"
          type="logo"
          entityId={null}
          value={imageUrl}
          onChange={setImageUrl}
          onRemove={() => setImageUrl("")}
          label="Imagen principal (opcional)"
        />
      </div>
      <div>
        <ImageGallery
          folder="events"
          entityId="new"
          images={images}
          onChange={setImages}
          label="Imágenes adicionales (opcionales, máx. 2)"
          maxImages={2}
        />
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
      <div>
        <label htmlFor="venueId" className={labelClass}>
          Sala (opcional)
        </label>
        <select
          id="venueId"
          name="venueId"
          className={inputClass}
          defaultValue={defaultVenueId ?? ""}
        >
          <option value="">Sin sala / Por confirmar</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        {venues.length === 0 && (
          <p className="mt-2 font-body text-sm text-punk-white/50">
            No hay salas aprobadas. Puedes crear el evento sin sala.
          </p>
        )}
      </div>
      <div>
        <label className={labelClass}>
          Bandas (opcional)
        </label>
        <div className="mt-2 max-h-40 space-y-2 overflow-y-auto border-2 border-punk-white/20 p-4">
          {bands.map((b) => (
            <label key={b.id} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" name="bandIds" value={b.id} className="accent-punk-red" />
              <span className="font-body text-punk-white/80">{b.name}</span>
            </label>
          ))}
          {bands.length === 0 && (
            <p className="font-body text-sm text-punk-white/50">No hay bandas aprobadas aún. Puedes crear el evento sin bandas; podrás añadirlas más tarde cuando estén registradas.</p>
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
      <div>
        <label className={labelClass}>Redes y enlaces (opcional)</label>
        <p className="mt-1 font-body text-sm text-punk-white/50">
          Instagram, Facebook, X (Twitter) o web del evento para enlazar publicaciones.
        </p>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <input id="instagramUrl" name="instagramUrl" type="url" className={inputClass} placeholder="Instagram" />
          <input id="facebookUrl" name="facebookUrl" type="url" className={inputClass} placeholder="Facebook" />
          <input id="twitterUrl" name="twitterUrl" type="url" className={inputClass} placeholder="X (Twitter)" />
          <input id="webUrl" name="webUrl" type="url" className={inputClass} placeholder="Web del evento" />
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2">
        <input type="checkbox" name="isSoldOut" className="accent-punk-red" />
        <span className={labelClass}>Entradas agotadas (SOLD OUT)</span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="border-2 border-punk-pink bg-punk-pink px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-pink/90 disabled:opacity-50"
      >
        {loading ? "Creando..." : "Crear evento"}
      </button>
      <p className="font-body text-sm text-punk-white/50">
        El evento quedará pendiente hasta que el administrador lo apruebe. Recibirás un aviso cuando esté visible en la agenda.
      </p>
    </form>
  );
}
