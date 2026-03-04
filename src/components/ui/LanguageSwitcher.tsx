"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useState } from "react";

const LOCALE_COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

function buildLocalizedUrl(pathname: string, newLocale: "es" | "eu"): string {
  const isAdminOrDashboard =
    pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
  const basePath = isAdminOrDashboard ? "/" : pathname;
  // Castellano (default): sin prefijo. Euskera: prefijo /eu
  if (newLocale === "es") return basePath || "/";
  return basePath === "/" ? "/eu" : `/eu${basePath}`;
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  const setLocale = (newLocale: "es" | "eu") => {
    if (locale === newLocale) return;
    document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
    setIsPending(true);
    // Recarga completa para que el layout raíz cargue los mensajes del nuevo locale
    const url = buildLocalizedUrl(pathname, newLocale);
    window.location.href = url;
  };

  return (
    <div className="flex items-center gap-1 border-l border-punk-white/20 pl-3">
      <button
        type="button"
        onClick={() => setLocale("es")}
        disabled={isPending}
        className={`font-punch text-xs uppercase tracking-widest transition-colors hover:text-punk-green disabled:opacity-50 ${
          locale === "es" ? "text-punk-green" : "text-punk-white/60"
        }`}
        aria-label="Cambiar a castellano"
      >
        ES
      </button>
      <span className="text-punk-white/30">|</span>
      <button
        type="button"
        onClick={() => setLocale("eu")}
        disabled={isPending}
        className={`font-punch text-xs uppercase tracking-widest transition-colors hover:text-punk-green disabled:opacity-50 ${
          locale === "eu" ? "text-punk-green" : "text-punk-white/60"
        }`}
        aria-label="Euskara-ra aldatu"
      >
        EU
      </button>
    </div>
  );
}
