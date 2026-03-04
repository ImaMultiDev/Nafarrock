"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";

export function ManifestoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const t = useTranslations("home.manifesto");

  const lineKeys = ["line1", "line2", "line3", "line4", "line5"] as const;

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-punk-red py-12 px-6 sm:py-20 sm:px-12 lg:py-28 lg:px-20 max-[299px]:px-3"
    >
      {/* Patrón diagonal */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 20px,
            rgba(0,0,0,0.3) 20px,
            rgba(0,0,0,0.3) 21px
          )`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl 2xl:max-w-[min(900px,92vw)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="font-punch mb-8 text-xl uppercase tracking-[0.5em] text-punk-black sm:mb-10 max-[299px]:text-base max-[299px]:tracking-[0.15em]">
            {t("philosophy")}
          </p>
          <div className="space-y-4 sm:space-y-5">
            {lineKeys.map((key, i) => (
              <motion.p
                key={key}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className={`font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight text-punk-white ${
                  i === 0 ? "italic opacity-90" : ""
                }`}
              >
                {t(key)}
              </motion.p>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-10 font-body text-lg text-punk-white/80 sm:mt-12"
          >
            {t("tagline")}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
