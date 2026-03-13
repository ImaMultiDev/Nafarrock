"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useIsPwaInstalled } from "@/hooks/useIsPwaInstalled";
import { InstallAppButton } from "@/components/ui/InstallAppButton";

export function InstallAppSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const isPwaInstalled = useIsPwaInstalled();

  if (isPwaInstalled) return null;

  return (
    <section
      ref={ref}
      className="relative border-t-2 border-punk-green/30 bg-punk-green/15 py-10 px-6 sm:py-14 sm:px-12 lg:px-20 max-[299px]:px-3"
    >
      <div className="relative z-10 mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex justify-center"
        >
          <InstallAppButton variant="section" />
        </motion.div>
      </div>
    </section>
  );
}
