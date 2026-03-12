"use client";

import { motion } from "framer-motion";
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
  bands: BandItem[];
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function BandasList({ bands }: Props) {
  return (
    <motion.div
      className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {bands.map((band) => (
        <motion.div key={band.id} variants={item}>
          <Link
            href={`/bandas/${band.slug}`}
            className="group relative block min-w-0 overflow-hidden border-2 border-punk-green bg-punk-black p-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,200,83,0.2)] md:p-6 max-[299px]:p-2"
          >
            <div
              className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-punk-green"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
            />
            {/* Mobile: horizontal compact (imagen izq, nombre + territorio der) */}
            <div className="flex flex-row items-stretch md:hidden">
              <div className="h-20 w-20 shrink-0 overflow-hidden border-r-2 border-punk-green/30">
                {band.logoUrl || band.imageUrl || (band.images && band.images[0]) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      band.logoUrl || band.imageUrl || (band.images?.[0] ?? "")
                    }
                    alt={band.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-punk-black/80 font-display text-2xl text-punk-green/50">
                    {band.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-2">
                <h2 className="font-display text-base font-medium tracking-tighter text-punk-white transition-colors group-hover:text-punk-green line-clamp-2">
                  {band.name}
                </h2>
                {band.location && (
                  <p className="mt-0.5 font-body text-sm text-punk-white/60">
                    {band.location}
                  </p>
                )}
              </div>
            </div>
            {/* Desktop: vertical clásico */}
            <div className="hidden md:block">
              <div className="aspect-[4/3] min-h-0 min-w-0 overflow-hidden border border-punk-white/10">
                {band.logoUrl || band.imageUrl || (band.images && band.images[0]) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      band.logoUrl || band.imageUrl || (band.images?.[0] ?? "")
                    }
                    alt={band.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-punk-black/80 font-display text-4xl text-punk-green/50">
                    {band.name.charAt(0)}
                  </div>
                )}
              </div>
              <h2 className="mt-4 font-display text-xl tracking-tighter text-punk-white transition-colors group-hover:text-punk-green">
                {band.name}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {band.genres.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    className="border border-punk-green/50 bg-punk-green/5 px-2 py-0.5 font-punch text-xs uppercase tracking-widest text-punk-green"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
