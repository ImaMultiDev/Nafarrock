"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const links = [
  {
    href: "/bandas",
    title: "BANDAS",
    desc: "Históricas y emergentes de Nafarroa",
    color: "punk-green",
    delay: 0,
    size: "large",
  },
  {
    href: "/eventos",
    title: "EVENTOS",
    desc: "Conciertos, festivales y entradas",
    color: "punk-red",
    delay: 0.1,
    size: "small",
  },
  {
    href: "/escena",
    title: "ESCENA",
    desc: "Salas, promotores, organizadores, festivales",
    color: "punk-acid",
    delay: 0.2,
    size: "small",
  },
  {
    href: "/guia",
    title: "GUÍA",
    desc: "Qué es Nafarrock",
    color: "punk-pink",
    delay: 0.3,
    size: "large",
  },
];

export function ExploreSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-punk-black pt-section-gap pb-12 px-6 sm:pt-section-gap sm:pb-20 sm:px-12 lg:pt-section-gap lg:pb-28 lg:px-20"
    >
      {/* Fondo con rayas diagonales */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          background: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            rgba(0,200,83,0.5) 40px,
            rgba(0,200,83,0.5) 41px
          )`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl 2xl:max-w-content-wide">
        {/* Título sección */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-10 sm:mb-16"
        >
          <h2 className="font-display text-5xl tracking-tighter text-punk-white sm:text-7xl">
            EXPLORA
          </h2>
          <p className="mt-3 max-w-xl font-body text-punk-white/60 sm:mt-4">
            Entra en la escena. Bandas que han moldeado el sonido nafarroar.
            Eventos que no te puedes perder.
          </p>
        </motion.div>

        {/* Grid estilo zine / collage */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-5">
          {links.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: item.delay, duration: 0.6 }}
              className={item.size === "large" ? "lg:row-span-2" : ""}
            >
              <Link
                href={item.href}
                className={`group relative block overflow-hidden border-2 bg-punk-black p-8 transition-all duration-300 hover:scale-[1.02] ${
                  item.color === "punk-green"
                    ? "border-punk-green hover:shadow-[0_0_40px_rgba(0,200,83,0.2)]"
                    : item.color === "punk-red"
                    ? "border-punk-red hover:shadow-[0_0_40px_rgba(230,0,38,0.2)]"
                    : item.color === "punk-pink"
                    ? "border-punk-pink hover:shadow-[0_0_40px_rgba(255,0,110,0.2)]"
                    : "border-punk-acid hover:shadow-[0_0_40px_rgba(200,255,0,0.2)]"
                }`}
              >
                {/* Rotación aleatoria estilo collage */}
                <motion.div
                  whileHover={{ rotate: i % 2 === 0 ? -1 : 1 }}
                  className={`h-full ${
                    item.size === "large" ? "flex flex-col justify-between" : ""
                  }`}
                >
                  <h3
                    className={`font-display text-3xl tracking-tighter transition-colors group-hover:scale-105 ${
                      item.color === "punk-green"
                        ? "text-punk-green"
                        : item.color === "punk-red"
                        ? "text-punk-red"
                        : item.color === "punk-pink"
                        ? "text-punk-pink"
                        : "text-punk-acid"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-4 font-body text-sm text-punk-white/70 group-hover:text-punk-white/90">
                    {item.desc}
                  </p>
                  <span
                    className={`mt-6 inline-block font-punch text-xs uppercase tracking-widest transition-all group-hover:translate-x-2 ${
                      item.color === "punk-green"
                        ? "text-punk-green"
                        : item.color === "punk-red"
                        ? "text-punk-red"
                        : item.color === "punk-pink"
                        ? "text-punk-pink"
                        : "text-punk-acid"
                    }`}
                  >
                    Entrar →
                  </span>
                </motion.div>

                {/* Esquina recortada efecto zine */}
                <div
                  className={`absolute right-0 top-0 h-16 w-16 border-t-2 border-r-2 ${
                    item.color === "punk-green"
                      ? "border-punk-green"
                      : item.color === "punk-red"
                      ? "border-punk-red"
                      : item.color === "punk-pink"
                      ? "border-punk-pink"
                      : "border-punk-acid"
                  }`}
                  style={{
                    clipPath: "polygon(100% 0, 100% 100%, 0 0)",
                  }}
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Línea decorativa */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.8, duration: 1 }}
          className="origin-left mt-12 h-1 bg-gradient-to-r from-punk-green via-punk-red to-punk-pink sm:mt-16"
        />
      </div>
    </section>
  );
}
