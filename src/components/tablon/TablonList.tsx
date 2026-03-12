"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

type Announcement = {
  id: string;
  title: string;
  category: string;
  territory: string | null;
  description: string;
  contactEmail: string;
  imageUrl: string | null;
  images: string[];
  createdAt: Date;
};

type Props = {
  announcements: Announcement[];
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

function AnnouncementCard({ a, t }: { a: Announcement; t: (key: string) => string }) {
  const mainImage = a.imageUrl || (a.images?.[0]);
  const extraImages = a.imageUrl ? (a.images ?? []) : (a.images?.slice(1) ?? []);
  const hasImages = !!mainImage || extraImages.length > 0;
  const descriptionPreview = a.description.length > 120 ? `${a.description.slice(0, 120)}…` : a.description;

  return (
    <Link href={`/tablon/${a.id}`}>
      <motion.article
        variants={item}
        className="block overflow-hidden border-2 border-punk-yellow/50 bg-punk-black transition-all duration-300 hover:border-punk-yellow/80 hover:shadow-[0_0_30px_rgba(255,214,10,0.1)]"
      >
        {/* Imágenes tipo feed: principal grande + galería pequeña */}
        {hasImages && (
          <div className="relative border-b-2 border-punk-yellow/20" onClick={(e) => e.stopPropagation()}>
            {mainImage ? (
              <div className="aspect-[16/10] w-full overflow-hidden bg-punk-black/80">
                <ImageLightbox
                  src={mainImage}
                  alt={a.title}
                  thumbnailClassName="h-full w-full object-cover cursor-pointer transition-transform hover:scale-[1.02]"
                />
              </div>
            ) : null}
            {extraImages.length > 0 && (
              <div className="grid grid-cols-2 gap-px border-t-2 border-punk-yellow/20 bg-punk-yellow/20">
                {extraImages.slice(0, 2).map((url, i) => (
                  <div key={i} className="aspect-[4/3] overflow-hidden bg-punk-black">
                    <ImageLightbox
                      src={url}
                      alt={`${a.title} - ${i + 2}`}
                      thumbnailClassName="h-full w-full object-cover cursor-pointer transition-transform hover:scale-[1.02]"
                    />
                  </div>
                ))}
              </div>
            )}
            {/* Esquina recortada estilo zine */}
            <div
              className="absolute right-0 top-0 h-12 w-12 border-t-2 border-r-2 border-punk-yellow/60"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
            />
          </div>
        )}

        {/* Contenido */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-punk-yellow/50 bg-punk-yellow/10 px-2 py-0.5 font-punch text-xs uppercase tracking-widest text-punk-yellow">
              {t(`categories.${a.category}`)}
            </span>
            {a.territory && (
              <span className="font-body text-sm text-punk-white/60">
                {a.territory}
              </span>
            )}
          </div>
          <h2 className="mt-2 font-display text-xl tracking-tighter text-punk-white sm:text-2xl">
            {a.title}
          </h2>
          <p className="mt-3 line-clamp-3 font-body text-punk-white/80">
            {descriptionPreview}
          </p>
          <span className="mt-4 inline-block font-punch text-xs uppercase tracking-widest text-punk-yellow transition-colors group-hover:text-punk-yellow/80">
            {t("contact")}: {a.contactEmail} →
          </span>
        </div>
      </motion.article>
    </Link>
  );
}

export function TablonList({ announcements }: Props) {
  const t = useTranslations("boardAnnouncement");

  return (
    <motion.div
      className="space-y-5 lg:space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {announcements.map((a) => (
        <AnnouncementCard key={a.id} a={a} t={t} />
      ))}
    </motion.div>
  );
}
