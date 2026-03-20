"use client";

import { Link } from "@/i18n/navigation";

type BandItem = {
  id: string;
  slug: string;
  name: string;
  genres: string[];
  location: string | null;
  logoUrl: string | null;
  imageUrl: string | null;
  images: string[] | null;
};

type Props = {
  band: BandItem;
};

export function BandasOptimizedCard({ band }: Props) {
  const imgSrc = band.logoUrl || band.imageUrl || band.images?.[0];

  return (
    <Link
      href={`/bandas/${band.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-punk-white/10 bg-punk-black transition-all duration-300 hover:border-punk-green/50 hover:shadow-[0_0_24px_rgba(0,200,83,0.12)] active:scale-[0.99]"
    >
      {/* Imagen: zona superior */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={band.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-punk-black/90 font-display text-5xl text-punk-green/40">
            {band.name.charAt(0)}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-punk-black via-punk-black/30 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="font-display text-lg font-semibold leading-tight text-punk-white transition-colors group-hover:text-punk-green line-clamp-2 sm:text-xl">
          {band.name}
        </h2>
        {band.location && (
          <p className="font-body text-sm text-punk-white/70">{band.location}</p>
        )}
        {band.genres.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2">
            {band.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded border border-punk-green/50 bg-punk-green/10 px-2.5 py-1 font-punch text-[10px] uppercase tracking-widest text-punk-green"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className="absolute right-0 top-0 h-10 w-10 border-t-2 border-r-2 border-punk-green/30 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
      />
    </Link>
  );
}
