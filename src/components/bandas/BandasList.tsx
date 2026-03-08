"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

type BandItem = {
  id: string;
  slug: string;
  name: string;
  genres: string[];
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
      className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {bands.map((band) => (
        <motion.div key={band.id} variants={item}>
          <Link
            href={`/bandas/${band.slug}`}
            className="group relative block min-w-0 overflow-hidden border-2 border-punk-green bg-punk-black p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,200,83,0.2)] max-[299px]:p-3"
          >
            <div
              className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-punk-green"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
            />
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
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
