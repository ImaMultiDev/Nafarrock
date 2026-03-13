"use client";

import { useEffect } from "react";

/**
 * Registra el Service Worker para que la PWA sea instalable.
 * Solo en el cliente y cuando el navegador lo soporta.
 */
export function PwaRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {})
        .catch(() => {});
    }
  }, []);

  return null;
}
