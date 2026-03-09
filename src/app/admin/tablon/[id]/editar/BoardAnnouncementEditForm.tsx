"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { BAND_LOCATIONS } from "@/lib/band-locations";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageGallery } from "@/components/ui/ImageGallery";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-yellow focus:outline-none";
const labelClass =
  "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

const CATEGORIES = [
  { value: "SE_BUSCA_MUSICO", key: "SE_BUSCA_MUSICO" },
  { value: "SE_BUSCAN_BANDAS", key: "SE_BUSCAN_BANDAS" },
  { value: "CONCURSO", key: "CONCURSO" },
  { value: "LOCAL_MATERIAL", key: "LOCAL_MATERIAL" },
  { value: "SERVICIOS", key: "SERVICIOS" },
  { value: "OTROS", key: "OTROS" },
] as const;

type Announcement = {
  id: string;
  title: string;
  category: string;
  territory: string | null;
  description: string;
  contactEmail: string;
  imageUrl: string | null;
  images: string[];
  approved: boolean;
};

export function BoardAnnouncementEditForm({
  announcement,
}: {
  announcement: Announcement;
}) {
  const router = useRouter();
  const t = useTranslations("boardAnnouncement");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(announcement.imageUrl ?? "");
  const [images, setImages] = useState<string[]>(announcement.images ?? []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch(`/api/admin/tablon/${announcement.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        category: formData.get("category"),
        territory: formData.get("territory") || null,
        description: formData.get("description"),
        contactEmail: formData.get("contactEmail"),
        imageUrl: imageUrl || null,
        images,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Error al guardar");
      return;
    }
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
          {t("fields.title")}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          defaultValue={announcement.title}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="category" className={labelClass}>
          {t("fields.category")}
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={announcement.category}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {t(`categories.${c.key}`)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="territory" className={labelClass}>
          {t("fields.territory")}
        </label>
        <select
          id="territory"
          name="territory"
          defaultValue={announcement.territory ?? ""}
          className={inputClass}
        >
          <option value="">—</option>
          {BAND_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>
      <div>
        <ImageUpload
          folder="board-announcements"
          type="logo"
          entityId={announcement.id}
          value={imageUrl}
          onChange={setImageUrl}
          onRemove={() => setImageUrl("")}
          label={t("fields.imageMain")}
        />
      </div>
      <div>
        <ImageGallery
          folder="board-announcements"
          entityId={announcement.id}
          images={images}
          onChange={setImages}
          label={t("fields.imageGallery")}
          maxImages={2}
        />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>
          {t("fields.description")}
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          required
          maxLength={5000}
          defaultValue={announcement.description}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="contactEmail" className={labelClass}>
          {t("fields.contactEmail")}
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          required
          defaultValue={announcement.contactEmail}
          className={inputClass}
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="border-2 border-punk-yellow bg-punk-yellow px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-yellow/90 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <Link
          href="/admin/solicitudes"
          className="border-2 border-punk-white/30 px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 transition-colors hover:border-punk-white"
        >
          Volver a solicitudes
        </Link>
      </div>
    </form>
  );
}
