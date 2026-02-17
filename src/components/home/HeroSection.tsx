"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative min-h-0 overflow-hidden bg-punk-black sm:min-h-hero-cap">
      {/* Grid sutil de fondo */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,200,83,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,83,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Gradiente radial explosivo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_0%,rgba(230,0,38,0.25)_0%,rgba(0,200,83,0.08)_40%,transparent_70%)]" />

      {/* Barras diagonales punk */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rotate-12 border-[6px] border-punk-green opacity-30" />
      <div className="absolute -left-48 top-1/3 h-64 w-64 -rotate-45 border-[4px] border-punk-red opacity-20" />
      <div className="absolute bottom-20 right-1/4 h-32 w-32 rotate-[70deg] border-[3px] border-punk-pink opacity-25" />

      {/* Guitarra de fondo - alineada con NAFARROCK, oscurecida para legibilidad */}
      <div className="absolute left-1/2 top-[25%] w-[120%] max-w-[900px] -translate-x-1/2 -translate-y-1/2 lg:left-0 lg:top-1/2 lg:w-[100%] lg:max-w-[1600px] lg:translate-x-0 lg:-translate-y-1/2">
        <Image
          src="/Logo_Sin_Texto.png"
          alt=""
          width={1000}
          height={710}
          className="hero-guitar-bg w-full object-contain"
          priority
        />
      </div>

      {/* Contenido principal - misma estructura que EXPLORA: padding fuera, max-w-7xl sin padding */}
      <div className="relative z-10 flex min-h-0 flex-col justify-start px-6 pt-14 pb-section-gap sm:min-h-hero-cap sm:px-12 sm:pt-20 sm:pb-section-gap lg:px-20 lg:pt-24 lg:pb-section-gap">
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-content-wide">
          <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left"
        >
          {/* Tagline arriba */}
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="font-punch mb-6 text-xs uppercase tracking-[0.35em] text-punk-green sm:mb-8 sm:text-sm sm:tracking-[0.4em]"
          >
            Nafarroa · Punk · Rock · Alternativo
          </motion.p>

          {/* Título NAFARROCK con glitch - más grande en mobile */}
          <h1 className="glitch-wrapper relative mx-auto font-display text-[clamp(5.5rem,22vw,12rem)] leading-[0.9] tracking-tighter lg:mx-0">
            <span className="invisible" aria-hidden>
              NAFARROCK
            </span>
            <span className="glitch-top">NAFARROCK</span>
            <span className="glitch-bottom">NAFARROCK</span>
            <span className="glitch-burst" aria-hidden>
              NAFARROCK
            </span>
            <span className="glitch-line" aria-hidden />
          </h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mx-auto mt-8 max-w-2xl font-body text-base leading-relaxed text-punk-white/80 sm:mt-10 sm:text-lg lg:mx-0 lg:text-left lg:text-xl"
          >
            La guía definitiva del punk rock, rock urbano y escena alternativa
            nafarroa. <span className="font-bold text-punk-green">Bandas</span>,{" "}
            <span className="font-bold text-punk-red">festivales</span>,{" "}
            <span className="font-bold text-punk-pink">conciertos</span> y
            salas. Memoria cultural y escena viva.
          </motion.p>

          {/* CTA buttons - centrados en mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-10 flex flex-wrap justify-center gap-4 sm:mt-12 sm:gap-5 lg:justify-start"
          >
            <Link
              href="/bandas"
              className="group relative overflow-hidden bg-punk-red px-8 py-4 font-punch text-sm uppercase tracking-widest text-punk-white transition-all duration-300 hover:bg-punk-blood hover:scale-105 hover:shadow-[0_0_30px_rgba(230,0,38,0.5)]"
            >
              Explorar bandas
            </Link>
            <Link
              href="/eventos"
              className="border-2 border-punk-green bg-transparent px-8 py-4 font-punch text-sm uppercase tracking-widest text-punk-green transition-all duration-300 hover:bg-punk-green hover:text-punk-black hover:scale-105"
            >
              Ver eventos
            </Link>
            <Link
              href="/salas"
              className="border-2 border-punk-white/40 bg-transparent px-8 py-4 font-punch text-sm uppercase tracking-widest text-punk-white/90 transition-all duration-300 hover:border-punk-white hover:bg-punk-white/10 hover:text-punk-white"
            >
              Salas
            </Link>
          </motion.div>
        </motion.div>

          {/* Scroll indicator - centrado horizontalmente en la sección, en el flujo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="mt-section-gap flex w-full justify-center"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2"
            >
              <span className="font-punch text-xs uppercase tracking-widest text-punk-white/50">
                Explorar
              </span>
              <div className="h-10 w-6 rounded-full border-2 border-punk-white/30 p-1">
                <motion.div
                  animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mx-auto h-1.5 w-1.5 rounded-full bg-punk-green"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scan line efecto */}
      <div className="scan-line pointer-events-none" />
    </section>
  );
}
