"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Resetea el scroll al cambiar de orientación o de ruta.
 * Evita que el contenido quede detrás del navbar tras rotar el móvil o navegar.
 */
export function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const onOrientationChange = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("orientationchange", onOrientationChange);
    return () => window.removeEventListener("orientationchange", onOrientationChange);
  }, []);

  return null;
}
