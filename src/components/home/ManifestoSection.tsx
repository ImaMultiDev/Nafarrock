"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const lines = [
  "Nafarrock no es solo una agenda.",
  "Es memoria cultural.",
  "Es escena viva.",
  "Es herramienta de visibilidad.",
  "Es comunidad.",
];

export function ManifestoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

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
            La filosofía
          </p>
          <div className="space-y-4 sm:space-y-5">
            {lines.map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className={`font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight text-punk-white ${
                  i === 0 ? "italic opacity-90" : ""
                }`}
              >
                {line}
              </motion.p>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-10 font-body text-lg text-punk-white/80 sm:mt-12"
          >
            Auténtico. No corporativo. Técnicamente profesional.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
