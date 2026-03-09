"use client";

import { useState } from "react";
import { BAND_LOCATIONS } from "@/lib/band-locations";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageGallery } from "@/components/ui/ImageGallery";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

export function BandProposalForm({ genres }: { genres: string[] }) {
  const router = useRouter();
  const t = useTranslations("dashboard.proposals.band.form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const selectedGenres = formData.getAll("genres") as string[];

    const res = await fetch("/api/proposals/band", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        bio: formData.get("bio") || undefined,
        genres: selectedGenres,
        location: formData.get("location") || undefined,
        foundedYear: formData.get("foundedYear")
          ? Number(formData.get("foundedYear"))
          : undefined,
        status: formData.get("status") || "ACTIVE",
        spotifyUrl: formData.get("spotifyUrl") || undefined,
        bandcampUrl: formData.get("bandcampUrl") || undefined,
        instagramUrl: formData.get("instagramUrl") || undefined,
        facebookUrl: formData.get("facebookUrl") || undefined,
        youtubeUrl: formData.get("youtubeUrl") || undefined,
        webUrl: formData.get("webUrl") || undefined,
        merchUrl: formData.get("merchUrl") || undefined,
        featuredVideoUrl: formData.get("featuredVideoUrl") || undefined,
        logoUrl: logoUrl || undefined,
        imageUrl: imageUrl || undefined,
        images,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? t("errorSend"));
      return;
    }
    router.push("/dashboard?proposed=band");
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
        <label htmlFor="name" className={labelClass}>
          {t("name")}
        </label>
        <input id="name" name="name" type="text" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="bio" className={labelClass}>
          {t("bio")}
        </label>
        <textarea id="bio" name="bio" rows={3} className={inputClass} />
      </div>
      <div>
        <ImageUpload
          folder="bands"
          type="logo"
          entityId={null}
          value={logoUrl}
          onChange={setLogoUrl}
          onRemove={() => setLogoUrl("")}
          label="Logo (opcional)"
        />
      </div>
      <div>
        <ImageUpload
          folder="bands"
          type="image"
          entityId={null}
          value={imageUrl}
          onChange={setImageUrl}
          onRemove={() => setImageUrl("")}
          label={t("imageMain")}
        />
      </div>
      <div>
        <ImageGallery
          folder="bands"
          entityId="proposal"
          images={images}
          onChange={setImages}
          label={t("gallery")}
          maxImages={3}
        />
      </div>
      <div>
        <label htmlFor="location" className={labelClass}>
          {t("territory")}
        </label>
        <select id="location" name="location" className={inputClass}>
          <option value="">—</option>
          {BAND_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="foundedYear" className={labelClass}>
          {t("foundedYear")}
        </label>
        <input
          id="foundedYear"
          name="foundedYear"
          type="number"
          min={1900}
          max={new Date().getFullYear()}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="status" className={labelClass}>
          {t("status")}
        </label>
        <select id="status" name="status" defaultValue="ACTIVE" className={inputClass}>
          <option value="ACTIVE">{t("statusActive")}</option>
          <option value="PAUSED">{t("statusPaused")}</option>
          <option value="INACTIVE">{t("statusInactive")}</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>{t("genres")}</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {genres.map((g) => (
            <label key={g} className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" name="genres" value={g} className="accent-punk-green" />
              <span className="font-body text-sm text-punk-white/80">{g}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="spotifyUrl" className={labelClass}>
            {t("spotify")}
          </label>
          <input id="spotifyUrl" name="spotifyUrl" type="url" className={inputClass} />
        </div>
        <div>
          <label htmlFor="instagramUrl" className={labelClass}>
            {t("instagram")}
          </label>
          <input id="instagramUrl" name="instagramUrl" type="url" className={inputClass} />
        </div>
        <div>
          <label htmlFor="youtubeUrl" className={labelClass}>
            {t("youtube")}
          </label>
          <input id="youtubeUrl" name="youtubeUrl" type="url" className={inputClass} />
        </div>
        <div>
          <label htmlFor="webUrl" className={labelClass}>
            {t("web")}
          </label>
          <input id="webUrl" name="webUrl" type="url" className={inputClass} />
        </div>
        <div>
          <label htmlFor="merchUrl" className={labelClass}>
            {t("merch")}
          </label>
          <input id="merchUrl" name="merchUrl" type="url" className={inputClass} placeholder={t("urlPlaceholder")} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="featuredVideoUrl" className={labelClass}>
            {t("featuredVideo")}
          </label>
          <input
            id="featuredVideoUrl"
            name="featuredVideoUrl"
            type="url"
            className={inputClass}
            placeholder={t("featuredVideoPlaceholder")}
          />
          <p className="mt-1 font-body text-xs text-punk-white/50">
            {t("featuredVideoHint")}
          </p>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="border-2 border-punk-green bg-punk-green px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-green/90 disabled:opacity-50"
        >
          {loading ? t("submitting") : t("submit")}
        </button>
        <Link
          href="/dashboard"
          className="border-2 border-punk-white/30 px-8 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 hover:border-punk-white"
        >
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}
