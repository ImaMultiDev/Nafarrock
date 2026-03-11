"use client";

const inputClass =
  "mt-2 w-full border-2 border-punk-white/20 bg-punk-black px-4 py-3 font-body text-punk-white placeholder:text-punk-white/40 focus:border-punk-green focus:outline-none";
const labelClass = "block font-punch text-xs uppercase tracking-widest text-punk-white/70";

type Props = {
  defaultWebsiteUrl?: string;
  defaultInstagramUrl?: string;
  defaultFacebookUrl?: string;
};

/** Campos fijos de redes sociales para eventos (Web, Instagram, Facebook) */
export function EventSocialLinksFields({
  defaultWebsiteUrl = "",
  defaultInstagramUrl = "",
  defaultFacebookUrl = "",
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="eventWebsiteUrl" className={labelClass}>
          Web
        </label>
        <input
          id="eventWebsiteUrl"
          name="websiteUrl"
          type="url"
          defaultValue={defaultWebsiteUrl}
          className={inputClass}
          placeholder="https://..."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="eventInstagramUrl" className={labelClass}>
            Instagram
          </label>
          <input
            id="eventInstagramUrl"
            name="instagramUrl"
            type="url"
            defaultValue={defaultInstagramUrl}
            className={inputClass}
            placeholder="https://instagram.com/..."
          />
        </div>
        <div>
          <label htmlFor="eventFacebookUrl" className={labelClass}>
            Facebook
          </label>
          <input
            id="eventFacebookUrl"
            name="facebookUrl"
            type="url"
            defaultValue={defaultFacebookUrl}
            className={inputClass}
            placeholder="https://facebook.com/..."
          />
        </div>
      </div>
    </div>
  );
}
