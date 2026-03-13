"use client";

import { useState, useEffect } from "react";

/**
 * Detecta si la PWA está instalada.
 * Cuando es true, los enlaces "Instalar app" deben ocultarse.
 *
 * Métodos de detección:
 * 1. display-mode: standalone → app abierta como PWA (Chrome/Edge)
 * 2. display-mode: minimal-ui → algunos navegadores
 * 3. navigator.standalone → Safari iOS (añadido a pantalla de inicio)
 * 4. getInstalledRelatedApps() → PWA instalada aunque se vea en navegador (Chrome 84+ Android, 140+ Desktop)
 */
export function useIsPwaInstalled(): boolean {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkStandalone = () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    const checkRelatedApps = async (): Promise<boolean> => {
      const getInstalled = (navigator as Navigator & { getInstalledRelatedApps?: () => Promise<unknown[]> })
        .getInstalledRelatedApps;
      if (typeof getInstalled !== "function") return false;

      try {
        const apps = await getInstalled();
        return Array.isArray(apps) && apps.some(
          (app: { platform?: string }) => app?.platform === "webapp"
        );
      } catch {
        return false;
      }
    };

    const runCheck = async () => {
      if (checkStandalone()) {
        setIsInstalled(true);
        return;
      }
      const relatedInstalled = await checkRelatedApps();
      setIsInstalled(relatedInstalled);
    };

    runCheck();

    const mqStandalone = window.matchMedia("(display-mode: standalone)");
    const mqMinimal = window.matchMedia("(display-mode: minimal-ui)");
    const handler = () => runCheck();
    mqStandalone.addEventListener("change", handler);
    mqMinimal.addEventListener("change", handler);
    return () => {
      mqStandalone.removeEventListener("change", handler);
      mqMinimal.removeEventListener("change", handler);
    };
  }, []);

  return isInstalled;
}
