"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function FooterSection() {
  return (
    <footer className="relative overflow-hidden border-t-2 border-punk-green bg-punk-black py-10 px-4 sm:py-12 sm:px-12 lg:py-14 lg:px-20 max-[299px]:px-3 max-[299px]:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,200,83,0.03)_0%,transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-7xl 2xl:max-w-content-wide">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-start"
          >
            <Link
              href="/"
              className="flex items-center gap-4 transition-opacity hover:opacity-90 max-[299px]:hidden"
            >
              <Image
                src="/logo.png"
                alt="Nafarrock"
                width={64}
                height={64}
                className="h-14 w-auto sm:h-16"
              />
              <span className="font-display text-4xl tracking-tighter text-punk-red">
                NAFAR<span className="text-punk-green">ROCK</span>
              </span>
            </Link>
            <p className="mt-2 font-body text-sm text-punk-white/60">
              Plataforma de la escena rock nafarroa
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 max-[299px]:grid max-[299px]:grid-cols-2 max-[299px]:gap-x-4 max-[299px]:gap-y-1"
          >
            <Link
              href="/bandas"
              className="font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:text-punk-green"
            >
              Bandas
            </Link>
            <Link
              href="/eventos"
              className="font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:text-punk-green"
            >
              Eventos
            </Link>
            <Link
              href="/salas"
              className="font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:text-punk-green"
            >
              Salas
            </Link>
            <Link
              href="/buscar"
              className="font-punch text-xs uppercase tracking-widest text-punk-white/70 transition-colors hover:text-punk-green"
            >
              Buscar
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 border-t border-punk-white/10 pt-8 text-center"
        >
          <p className="font-body text-xs text-punk-white/40">
            © {new Date().getFullYear()} Nafarrock · Punk · Rock · Nafarroa
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
