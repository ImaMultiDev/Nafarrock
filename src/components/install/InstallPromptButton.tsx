"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useInstallPrompt } from "@/contexts/InstallPromptContext";

/**
 * Botón prominente para la página /instalar.
 * Solo se muestra cuando el navegador puede mostrar el prompt nativo (Chrome, Edge).
 * Al pulsar, abre el popup "¿Descargar Nafarrock?" del navegador.
 */
export function InstallPromptButton() {
  const t = useTranslations("install");
  const { canPrompt, triggerInstall } = useInstallPrompt();
  const [isLoading, setIsLoading] = useState(false);

  if (!canPrompt) return null;

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await triggerInstall();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="inline-flex items-center gap-3 rounded-xl border-2 border-punk-green bg-punk-green px-8 py-4 font-punch text-lg uppercase tracking-widest text-punk-black transition-colors hover:bg-punk-green/90 disabled:opacity-70"
    >
      <img
        src="/svg/download-svgrepo-com.svg"
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 object-contain"
        style={{ filter: "brightness(0)" }}
      />
      <span>{isLoading ? "..." : t("installNow")}</span>
    </button>
  );
}
