"use client";

import { usePathname } from "@/i18n/navigation";
import { useEffect } from "react";

/**
 * Oculta el scroll del body en la página del mapa (mobile)
 */
export function MapPageBodyOverflow() {
  const pathname = usePathname();
  const isMapPage = pathname === "/mapa" || pathname.endsWith("/mapa");

  useEffect(() => {
    if (!isMapPage) return;
    const prev = document.body.style.overflow;
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      document.body.style.overflow = mq.matches ? "hidden" : "";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      document.body.style.overflow = prev;
      mq.removeEventListener("change", apply);
    };
  }, [isMapPage]);

  return null;
}
