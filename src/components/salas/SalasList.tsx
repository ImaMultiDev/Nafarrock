"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";

type VenueItem = {
  id: string;
  slug: string;
  name: string;
  city: string;
  capacity: number | null;
  logoUrl: string | null;
  imageUrl: string | null;
  images: string[] | null;
};

type Props = {
  venues: VenueItem[];
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

export function SalasList({ venues }: Props) {
  return (
    <motion.div
      className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {venues.map((venue) => (
        <motion.div key={venue.id} variants={item}>
          <Link
            href={`/salas/${venue.slug}`}
            className="group relative block min-w-0 overflow-hidden border-2 border-punk-pink bg-punk-black p-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,0,110,0.2)] md:p-6 max-[299px]:p-2"
          >
            <div
              className="absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 border-punk-pink"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
            />
            {/* Rectangular: imagen izq, datos der */}
            <div className="flex flex-row items-stretch">
              <div className="h-20 w-20 shrink-0 overflow-hidden border-r-2 border-punk-pink/30 md:h-24 md:w-24">
                {venue.logoUrl || venue.imageUrl || (venue.images && venue.images[0]) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={venue.logoUrl || venue.imageUrl || venue.images?.[0] ?? ""}
                    alt={venue.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-punk-black/80 font-display text-2xl text-punk-pink/50 md:text-3xl">
                    {venue.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-2 md:px-5 md:py-4">
                <h2 className="font-display text-base font-medium tracking-tighter text-punk-white transition-colors group-hover:text-punk-pink line-clamp-2 md:text-xl">
                  {venue.name}
                </h2>
                {venue.city && (
                  <p className="mt-0.5 font-body text-sm text-punk-white/60">{venue.city}</p>
                )}
                {venue.capacity && (
                  <p className="mt-1 font-punch text-[10px] uppercase tracking-widest text-punk-pink/80 md:text-xs">
                    Aforo: {venue.capacity} personas
                  </p>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
