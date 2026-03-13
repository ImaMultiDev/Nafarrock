"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useInstallPrompt } from "@/contexts/InstallPromptContext";

type InstallAppButtonProps = {
  /** Estilo: menú hamburguesa o sección home */
  variant: "menu" | "section";
  /** Llamado tras el clic (ej. cerrar menú) */
  onNavigate?: () => void;
  /** Si está activo (ruta /instalar) */
  isActive?: boolean;
};

export function InstallAppButton({
  variant,
  onNavigate,
  isActive = false,
}: InstallAppButtonProps) {
  const t = useTranslations("common.nav");
  const { canPrompt, triggerInstall } = useInstallPrompt();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    if (canPrompt) {
      e.preventDefault();
      setIsLoading(true);
      try {
        await triggerInstall();
        onNavigate?.();
      } finally {
        setIsLoading(false);
      }
    } else {
      onNavigate?.();
    }
  };

  const baseClasses =
    variant === "menu"
      ? "flex w-full items-center gap-2 rounded-lg border-2 px-4 py-3 font-punch text-sm uppercase tracking-widest transition-colors"
      : "inline-flex items-center gap-3 rounded-lg border-2 border-punk-green bg-punk-green/20 px-6 py-4 font-punch text-sm uppercase tracking-widest transition-colors sm:px-8 sm:py-4 sm:text-base";

  const activeClasses = isActive
    ? "border-punk-green bg-punk-green/25 text-punk-green"
    : "border-punk-green/60 bg-punk-green/20 text-punk-white/90 hover:bg-punk-green/30 hover:text-punk-green";

  const content = (
    <>
      <img
        src="/svg/download-svgrepo-com.svg"
        alt=""
        width={variant === "menu" ? 20 : 24}
        height={variant === "menu" ? 20 : 24}
        className={`shrink-0 object-contain ${variant === "menu" ? "h-5 w-5" : "h-6 w-6"}`}
        style={{
          filter:
            isActive && variant === "menu"
              ? "brightness(0) saturate(100%) invert(70%) sepia(100%) saturate(5000%) hue-rotate(90deg)"
              : "brightness(0) invert(1)",
        }}
      />
      <span className={variant === "menu" ? "flex-1 text-center" : ""}>
        {isLoading ? "..." : t("installApp")}
      </span>
      {variant === "menu" && <span className="h-5 w-5 shrink-0" aria-hidden />}
    </>
  );

  if (canPrompt) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={`${baseClasses} ${activeClasses} disabled:opacity-70`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href="/instalar"
      onClick={onNavigate}
      className={`${baseClasses} ${activeClasses}`}
    >
      {content}
    </Link>
  );
}
