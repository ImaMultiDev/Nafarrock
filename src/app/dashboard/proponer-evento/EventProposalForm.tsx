"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { EventSocialLinksFields } from "@/components/admin/EventSocialLinksFields";
import { VenueFestivalSelect } from "@/components/admin/VenueFestivalSelect";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Venue = { id: string; name: string };
type Festival = { id: string; name: string };
type Band = { id: string; name: string };

function parseVenueOrFestival(val: string | null): { venueId: string | null; festivalId: string | null; useText: boolean } {
  if (!val || !val.trim()) return { venueId: null, festivalId: null, useText: false };
  if (val.startsWith("venue-")) return { venueId: val.slice(6), festivalId: null, useText: false };
  if (val.startsWith("festival-")) return { venueId: null, festivalId: val.slice(9), useText: false };
  if (val === "text") return { venueId: null, festivalId: null, useText: true };
  return { venueId: null, festivalId: null, useText: false };
}

export function EventProposalForm({
  venues,
  festivals,
  bands,
}: {
  venues: Venue[];
  festivals: Festival[];
  bands: Band[];
}) {
  const router = useRouter();
  const t = useTranslations("dashboard.proposals.event.form");
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
        setError(t("errorEndDate"));
        setLoading(false);
        return;
      }
      endDate = end.toISOString();
    }

    const { venueId, festivalId, useText } = parseVenueOrFestival(formData.get("venueOrFestival") as string | null);
    const venueText = useText ? (formData.get("venueText") as string)?.trim() || null : null;

    const res = await fetch("/api/proposals/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        type: formData.get("type"),
        date: date.toISOString(),
        endDate,
        venueId: venueId || undefined,
        festivalId: festivalId || undefined,
        venueText: venueText || undefined,
        doorsOpen: formData.get("doorsOpen") || undefined,
        description: formData.get("description") || undefined,
        price: formData.get("price") || undefined,
        ticketUrl: formData.get("ticketUrl") || undefined,
        websiteUrl: formData.get("websiteUrl") || undefined,
        instagramUrl: formData.get("instagramUrl") || undefined,
        facebookUrl: formData.get("facebookUrl") || undefined,
        imageUrl: imageUrl || undefined,
        images: images,
        isSoldOut: (formData.get("isSoldOut") as string) === "on",
        bandIds: bandIds.filter(Boolean),
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Error al enviar");
      return;
    }
    router.push("/dashboard?proposed=event");
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
          {t("title")}
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
          entityId="proposal"
          images={images}
          onChange={setImages}
          label={t("gallery")}
          maxImages={2}
        />
      </div>
      <div>
        <label htmlFor="type" className={labelClass}>
          {t("type")}
        </label>
        <select id="type" name="type" className={inputClass}>
          <option value="CONCIERTO">{t("typeConcert")}</option>
          <option value="FESTIVAL">{t("typeFestival")}</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>{t("duration")}</label>
        <div className="mt-2 flex gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="duration" checked={!isMultiDay} onChange={() => setIsMultiDay(false)} className="accent-punk-red" />
            <span className="font-body text-punk-white/90">{t("oneDay")}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="duration" checked={isMultiDay} onChange={() => setIsMultiDay(true)} className="accent-punk-red" />
            <span className="font-body text-punk-white/90">{t("multiDay")}</span>
          </label>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className={labelClass}>
            {isMultiDay ? t("dateStart") : t("dateTime")}
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
              {t("dateEnd")}
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
              {t("doors")}
            </label>
            <input id="doorsOpen" name="doorsOpen" type="text" className={inputClass} placeholder={t("doorsPlaceholder")} />
          </div>
        )}
      </div>
      {isMultiDay && (
        <div>
          <label htmlFor="doorsOpen" className={labelClass}>
            {t("doorsOptional")}
          </label>
          <input id="doorsOpen" name="doorsOpen" type="text" className={inputClass} placeholder={t("doorsMultiPlaceholder")} />
        </div>
      )}
      <VenueFestivalSelect venues={venues} festivals={festivals} />
      <div>
        <label className={labelClass}>
          {t("bands")}
        </label>
        <div className="mt-2 max-h-40 space-y-2 overflow-y-auto border-2 border-punk-white/20 p-4">
          {bands.map((b) => (
            <label key={b.id} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" name="bandIds" value={b.id} className="accent-punk-red" />
              <span className="font-body text-punk-white/80">{b.name}</span>
            </label>
          ))}
          {bands.length === 0 && (
            <p className="font-body text-sm text-punk-white/50">
              {t("bandsEmpty")}
            </p>
          )}
        </div>
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>
          {t("description")}
        </label>
        <textarea id="description" name="description" rows={3} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={labelClass}>
            {t("price")}
          </label>
          <input id="price" name="price" type="text" className={inputClass} placeholder={t("pricePlaceholder")} />
        </div>
        <div>
          <label htmlFor="ticketUrl" className={labelClass}>
            {t("ticketUrl")}
          </label>
          <input id="ticketUrl" name="ticketUrl" type="url" className={inputClass} />
        </div>
      </div>
      <EventSocialLinksFields />
      <label className="flex cursor-pointer items-center gap-2">
        <input type="checkbox" name="isSoldOut" className="accent-punk-red" />
        <span className={labelClass}>Entradas agotadas (SOLD OUT)</span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="border-2 border-punk-pink bg-punk-pink px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-pink/90 disabled:opacity-50"
      >
        {loading ? t("submitting") : t("submit")}
      </button>
      <p className="font-body text-sm text-punk-white/50">
        {t("reviewHint")}
      </p>
    </form>
  );
}
