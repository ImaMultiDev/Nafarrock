"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const LINKS = [
  { href: "/eventos", key: "events" as const, color: "punk-red" },
  { href: "/bandas", key: "bands" as const, color: "punk-green" },
  { href: "/mapa", key: "map" as const, color: "punk-acid" },
  { href: "/tablon", key: "announcements" as const, color: "punk-yellow" },
] as const;

export function DataFocusedQuickLinks() {
  const t = useTranslations("home.explore");

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="border-t-2 border-punk-white/10 px-4 py-6 sm:px-6 sm:py-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl 2xl:max-w-content-wide">
        <h2 className="mb-4 font-punch text-xs uppercase tracking-[0.2em] text-punk-white/70 sm:mb-5">
          EXPLORA
        </h2>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {LINKS.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
            >
              <Link
                href={item.href}
                className={`inline-block rounded-lg border-2 px-4 py-2.5 font-punch text-xs uppercase tracking-widest transition-all hover:scale-105 ${
                  item.color === "punk-red"
                    ? "border-punk-red/50 text-punk-red hover:bg-punk-red/20 hover:border-punk-red"
                    : item.color === "punk-green"
                      ? "border-punk-green/50 text-punk-green hover:bg-punk-green/20 hover:border-punk-green"
                      : item.color === "punk-yellow"
                        ? "border-punk-yellow/50 text-punk-yellow hover:bg-punk-yellow/20 hover:border-punk-yellow"
                        : "border-punk-acid/50 text-punk-acid hover:bg-punk-acid/20 hover:border-punk-acid"
                }`}
              >
                {t(`${item.key}.title`)}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
