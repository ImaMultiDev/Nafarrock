"use client";

import { motion } from "framer-motion";

const PUNK_SVG_FILTER =
  "brightness(0) saturate(100%) invert(36%) sepia(100%) saturate(5000%) hue-rotate(310deg)";

function PunkSvgIcon({ className, size = 96 }: { className?: string; size?: number }) {
  return (
    <img
      src="/svg/punk-svgrepo-com.svg"
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ filter: PUNK_SVG_FILTER }}
    />
  );
}

export function PerfilHeader() {
  return (
    <div className="mb-8">
      {/* Mobile: solo SVG con animación */}
      <div className="flex justify-center lg:hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative h-24 w-24"
        >
          <motion.div
            animate={{ y: [0, 6, 0], opacity: [1, 0.85, 1] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-full w-full"
          >
            <PunkSvgIcon size={96} className="h-full w-full object-contain" />
          </motion.div>
        </motion.div>
      </div>

      {/* Desktop: título + descripción + SVG a la derecha */}
      <div className="hidden items-start justify-between gap-6 lg:flex">
        <div>
          <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
            Mi perfil
          </h1>
          <p className="mt-2 font-body text-punk-white/60">
            Gestiona tus datos personales y el estado de tu entidad
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative h-16 w-16 shrink-0"
        >
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-full w-full"
          >
            <PunkSvgIcon size={64} className="h-full w-full object-contain" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
