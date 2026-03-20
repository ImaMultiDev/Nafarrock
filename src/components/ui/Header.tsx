"use client";

const EDITORIAL_MVP_MODE = true;

import NextLink from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { InboxBadge } from "@/components/InboxBadge";
import { useIsPwaInstalled } from "@/hooks/useIsPwaInstalled";
import { InstallAppButton } from "@/components/ui/InstallAppButton";

const navLinks = [
  { href: "/", labelKey: "home" as const },
  { href: "/eventos", labelKey: "events" as const },
  {
    labelKey: "scene" as const,
    dropdown: [
      { href: "/bandas", labelKey: "bands" as const },
      { href: "/salas", labelKey: "salas" as const },
      { href: "/festivales", labelKey: "festivals" as const },
      { href: "/mapa", labelKey: "map" as const },
    ] as const,
  },
  { href: "/tablon", labelKey: "tablon" as const },
];

const MOBILE_NAV_ICONS: Record<string, string> = {
  home: "/svg/home-sketch-svgrepo-com.svg",
  events: "/svg/halloween-october-31-calendar-page-sketch-svgrepo-com.svg",
  scene: "/svg/rock-on-svgrepo-com.svg",
  bands: "/svg/group-549-svgrepo-com.svg",
  salas: "/svg/guitar-pick-svgrepo-com.svg",
  festivals: "/svg/calendar-event-svgrepo-com.svg",
  map: "/svg/map2-svgrepo-com.svg",
  tablon: "/svg/trumpet-svgrepo-com.svg",
  installApp: "/svg/download-svgrepo-com.svg",
};

const MANUAL_ROLES = [
  "BANDA",
  "SALA",
  "FESTIVAL",
  "ASOCIACION",
  "PROMOTOR",
  "ORGANIZADOR",
  "ADMIN",
];
const ROLE_TO_MANUAL_SLUG: Record<string, string> = {
  BANDA: "banda",
  SALA: "sala",
  FESTIVAL: "festival",
  ASOCIACION: "asociacion",
  PROMOTOR: "promotor",
  ORGANIZADOR: "organizador",
  ADMIN: "admin",
};

function getGuideOrManualLink(
  session: { user?: { role?: string | null } } | null,
  t: (key: string) => string,
) {
  const role = session?.user?.role;
  if (role && MANUAL_ROLES.includes(role)) {
    const slug = ROLE_TO_MANUAL_SLUG[role];
    return { href: `/manual/${slug}`, label: t("manual") };
  }
  return { href: "/guia", label: t("guide") };
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/bolos")
    return pathname === "/bolos" || pathname.startsWith("/bolos/");
  if (href === "/bolos-nav")
    return pathname === "/bolos" || pathname.startsWith("/bolos/");
  if (
    href === "/escena" ||
    href === "/bandas" ||
    href === "/salas" ||
    href === "/festivales" ||
    href === "/mapa"
  ) {
    return (
      pathname === "/escena" ||
      pathname.startsWith("/bandas") ||
      pathname.startsWith("/promotores") ||
      pathname.startsWith("/organizadores") ||
      pathname.startsWith("/festivales") ||
      pathname.startsWith("/asociaciones") ||
      pathname.startsWith("/salas") ||
      pathname.startsWith("/mapa")
    );
  }
  if (href === "/guia") return pathname === "/guia";
  if (href === "/tablon")
    return pathname === "/tablon" || pathname.startsWith("/tablon/");
  if (href.startsWith("/manual")) return pathname.startsWith("/manual");
  return pathname === href || pathname.startsWith(href + "/");
}

function isEscenaActive(pathname: string): boolean {
  return (
    pathname === "/escena" ||
    pathname.startsWith("/bandas") ||
    pathname.startsWith("/salas") ||
    pathname.startsWith("/festivales") ||
    pathname.startsWith("/mapa") ||
    pathname.startsWith("/promotores") ||
    pathname.startsWith("/organizadores") ||
    pathname.startsWith("/asociaciones")
  );
}

/** Solo el ítem concreto del desplegable ESCENA está activo (ej: en /bandas solo BANDAS) */
function isEscenaSubActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Header() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("common.nav");
  const tCommon = useTranslations("common");
  const { data: session } = useSession();
  const isAdmin = pathname.startsWith("/admin");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [sceneOpen, setSceneOpen] = useState(false);
  const [sceneMobileOpen, setSceneMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sceneDropdownRef = useRef<HTMLDivElement>(null);
  const isPwaInstalled = useIsPwaInstalled();

  const MENU_TRANSITION_MS = 350;

  /** En estas páginas el letrero neón no debe ser enlace (evita error al clicar) */
  const isDashboardNoRedirect =
    pathname === "/dashboard" ||
    pathname === "/dashboard/" ||
    pathname.includes("/dashboard/perfil") ||
    pathname === "/dashboard/buzon" ||
    pathname.startsWith("/dashboard/buzon/") ||
    pathname.includes("/dashboard/proponer-banda") ||
    pathname.includes("/dashboard/proponer-evento") ||
    pathname.includes("/dashboard/proponer-anuncio");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      setMenuClosing(true);
      const t = setTimeout(() => setMenuClosing(false), MENU_TRANSITION_MS);
      return () => clearTimeout(t);
    } else {
      setMenuClosing(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        sceneDropdownRef.current &&
        !sceneDropdownRef.current.contains(e.target as Node)
      ) {
        setSceneOpen(false);
      }
    }
    if (sceneOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [sceneOpen]);

  useEffect(() => {
    if (menuOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      history.pushState({ menuOpen: true }, "", window.location.href);
      const onEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") history.back();
      };
      window.addEventListener("keydown", onEscape);
      return () => window.removeEventListener("keydown", onEscape);
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      setSceneMobileOpen(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    const onPopState = () => {
      setMenuOpen(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <header
      className={`sticky top-0 border-b-2 border-punk-red bg-punk-black/95 backdrop-blur-md ${menuOpen || menuClosing ? "z-[10000]" : "z-50"}`}
    >
      {/* Letrero neón LASTER - en construcción, cruza el navbar */}
      <div
        className="neon-laster-badge pointer-events-none absolute bottom-0 left-1/2 z-10"
        aria-hidden
      >
        <div className="neon-laster-sign">
          <span className="neon-laster-text font-display text-xl tracking-[0.35em] sm:text-2xl sm:tracking-[0.4em]">
            LASTER
          </span>
        </div>
      </div>

      <nav className="relative flex w-full min-w-0 items-center justify-between px-3 py-3 sm:px-6 lg:px-12 max-[299px]:px-2">
        {/* Logo a la izquierda + NAFARROCK centrado y más grande en mobile */}
        <div className="flex flex-1 items-center nav:flex-initial">
          {(() => {
            const logoContent = pathname.startsWith("/mapa") ? (
              <span className="neon-mapa-sign">
                <span className="neon-mapa-text font-display text-2xl tracking-tighter sm:text-3xl">
                  {t("map")}
                </span>
              </span>
            ) : pathname.startsWith("/eventos") ? (
              <span className="neon-mapa-sign">
                <span className="neon-mapa-text font-display text-2xl tracking-tighter sm:text-3xl">
                  {t("events")}
                </span>
              </span>
            ) : pathname.startsWith("/bandas") ? (
              <span className="neon-mapa-sign">
                <span className="neon-mapa-text font-display text-2xl tracking-tighter sm:text-3xl">
                  {t("bands")}
                </span>
              </span>
            ) : pathname.startsWith("/salas") ? (
              <span className="neon-mapa-sign">
                <span className="neon-mapa-text font-display text-2xl tracking-tighter sm:text-3xl">
                  {t("salas")}
                </span>
              </span>
            ) : pathname.startsWith("/festivales") ? (
              <span className="neon-mapa-sign">
                <span className="neon-mapa-text font-display text-2xl tracking-tighter sm:text-3xl">
                  {t("festivals")}
                </span>
              </span>
            ) : pathname.startsWith("/tablon") ? (
              <span className="neon-mapa-sign">
                <span className="neon-mapa-text font-display text-2xl tracking-tighter sm:text-3xl">
                  {t("tablon")}
                </span>
              </span>
            ) : pathname === "/dashboard/buzon" ||
              pathname.startsWith("/dashboard/buzon/") ? (
              <span className="neon-mapa-sign">
                <span className="neon-mapa-text font-display text-2xl tracking-tighter sm:text-3xl">
                  {t("inbox")}
                </span>
              </span>
            ) : pathname === "/dashboard" || pathname === "/dashboard/" ? (
              <span className="neon-mapa-sign">
                <span className="neon-mapa-text font-display text-2xl tracking-tighter sm:text-3xl">
                  {t("panel")}
                </span>
              </span>
            ) : pathname.includes("/dashboard/perfil") ? (
              <span className="neon-mapa-sign">
                <span className="neon-mapa-text font-display text-2xl tracking-tighter sm:text-3xl">
                  {t("myProfileNeon")}
                </span>
              </span>
            ) : pathname.includes("/dashboard/proponer-banda") ? (
              <span className="neon-mapa-sign">
                <span className="neon-mapa-text font-display text-2xl tracking-tighter sm:text-3xl">
                  {t("bandsNeon")}
                </span>
              </span>
            ) : pathname.includes("/dashboard/proponer-evento") ? (
              <span className="neon-mapa-sign">
                <span className="neon-mapa-text font-display text-2xl tracking-tighter sm:text-3xl">
                  {t("eventsNeon")}
                </span>
              </span>
            ) : pathname.includes("/dashboard/proponer-anuncio") ? (
              <span className="neon-mapa-sign">
                <span className="neon-mapa-text font-display text-2xl tracking-tighter sm:text-3xl">
                  {t("tablon")}
                </span>
              </span>
            ) : pathname === "/" ? (
              <span className="neon-mapa-sign">
                <span className="neon-mapa-text font-display text-2xl tracking-tighter sm:text-3xl">
                  {t("home")}
                </span>
              </span>
            ) : (
              <Image
                src="/logo.png"
                alt={tCommon("logoAlt")}
                width={64}
                height={64}
                className="h-10 w-auto sm:h-12"
                priority
              />
            );
            return isDashboardNoRedirect ? (
              <span className="flex shrink-0 items-center" aria-hidden>
                {logoContent}
              </span>
            ) : (
              <Link
                href={
                  pathname.startsWith("/mapa")
                    ? "/mapa"
                    : pathname.startsWith("/eventos")
                      ? "/eventos"
                      : pathname.startsWith("/bandas")
                        ? "/bandas"
                        : pathname.startsWith("/salas")
                          ? "/salas"
                          : pathname.startsWith("/festivales")
                            ? "/festivales"
                            : pathname.startsWith("/tablon")
                              ? "/tablon"
                              : pathname.startsWith("/dashboard/buzon")
                                ? "/dashboard/buzon"
                                : pathname.includes("/dashboard/perfil")
                                  ? "/dashboard/perfil"
                                  : pathname.includes(
                                        "/dashboard/proponer-banda",
                                      )
                                    ? "/dashboard/proponer-banda"
                                    : pathname.includes(
                                          "/dashboard/proponer-evento",
                                        )
                                      ? "/dashboard/proponer-evento"
                                      : pathname.includes(
                                            "/dashboard/proponer-anuncio",
                                          )
                                        ? "/dashboard/proponer-anuncio"
                                        : pathname === "/dashboard" ||
                                            pathname === "/dashboard/"
                                          ? "/dashboard"
                                          : "/"
                }
                className="flex shrink-0 items-center transition-opacity hover:opacity-90"
              >
                {logoContent}
              </Link>
            );
          })()}
          <Link
            href="/"
            className="relative flex flex-1 justify-center py-2 transition-opacity hover:opacity-90 nav:ml-3 nav:flex-initial nav:justify-start max-[299px]:hidden"
          >
            <span className="font-display text-3xl tracking-tighter sm:text-4xl nav:text-4xl">
              <span className="nav-logo-nafar">NAFAR</span>
              <span className="nav-logo-rock">ROCK</span>
            </span>
          </Link>
        </div>

        {/* Desktop: nav + redes + auth */}
        <div className="hidden items-center gap-6 nav:flex">
          {navLinks.map((link) => {
            if ("dropdown" in link) {
              return (
                <div
                  key={link.labelKey}
                  className="relative"
                  ref={sceneDropdownRef}
                >
                  <button
                    type="button"
                    onClick={() => setSceneOpen(!sceneOpen)}
                    className={`flex items-center gap-1 font-punch text-xs uppercase tracking-widest transition-colors hover:text-punk-green ${
                      isEscenaActive(pathname)
                        ? "nav-link-active text-punk-red"
                        : "text-punk-white/80"
                    }`}
                    aria-expanded={sceneOpen}
                    aria-haspopup="true"
                  >
                    {t(link.labelKey)}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${sceneOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {sceneOpen && (
                    <div className="absolute left-0 top-12 z-50 flex min-w-[240px] flex-nowrap gap-0 border-b-2 border-l-2 border-r-2 border-punk-red bg-punk-black py-2 shadow-lg">
                      {(link.dropdown ?? []).map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setSceneOpen(false)}
                          className={`relative whitespace-nowrap px-4 py-2 font-punch text-xs uppercase tracking-widest transition-colors hover:bg-punk-green/20 hover:text-punk-green ${
                            isEscenaSubActive(pathname, sub.href)
                              ? "nav-link-active text-punk-red after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:skew-x-[-12deg] after:bg-punk-red after:content-['']"
                              : "text-punk-white/90"
                          }`}
                        >
                          {t(sub.labelKey)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-punch text-xs uppercase tracking-widest transition-colors hover:text-punk-green ${
                  active
                    ? "nav-link-active text-punk-red after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:skew-x-[-12deg] after:bg-punk-red after:content-['']"
                    : "text-punk-white/80"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
          {session && !EDITORIAL_MVP_MODE && (
            <Link
              href="/bolos"
              className={`relative shrink-0 font-punch text-xs uppercase tracking-widest transition-colors hover:text-punk-green ${
                isActivePath(pathname, "/bolos-nav")
                  ? "nav-link-active text-punk-red after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:skew-x-[-12deg] after:bg-punk-red after:content-['']"
                  : "text-punk-white/80"
              }`}
            >
              {t("bolos")}
            </Link>
          )}
          {(() => {
            const guideLink = getGuideOrManualLink(session, t);
            const active = isActivePath(pathname, guideLink.href);
            return (
              <Link
                href={guideLink.href}
                className={`relative font-punch text-xs uppercase tracking-widest transition-colors hover:text-punk-green ${
                  active
                    ? "nav-link-active text-punk-red after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:skew-x-[-12deg] after:bg-punk-red after:content-['']"
                    : "text-punk-white/80"
                }`}
              >
                {guideLink.label}
              </Link>
            );
          })()}
          {!isAdmin && <LanguageSwitcher />}
          {session ? (
            <div className="ml-4 flex items-center gap-2">
              <NextLink
                href="/dashboard"
                className="border-2 border-punk-red bg-punk-red px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white transition-colors hover:bg-transparent hover:text-punk-red"
              >
                {t("panel")}
              </NextLink>
              <InboxBadge variant="desktop-icon" />
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              {!EDITORIAL_MVP_MODE && (
                <Link
                  href="/auth/reclamar"
                  className="border-2 border-punk-white/40 px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-colors hover:border-punk-green hover:text-punk-green"
                >
                  {t("claim")}
                </Link>
              )}
              <Link
                href="/auth/login"
                className="border-2 border-punk-red bg-punk-red px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white transition-colors hover:bg-transparent hover:text-punk-red"
              >
                {t("login")}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: hamburger - absoluto a la derecha para que logo quede centrado */}
        <button
          type="button"
          onClick={() => (menuOpen ? history.back() : setMenuOpen(true))}
          className="absolute right-4 top-1/2 flex h-10 w-10 shrink-0 -translate-y-1/2 items-center justify-center rounded border border-punk-white/30 text-punk-white nav:relative nav:right-0 nav:top-0 nav:translate-y-0 nav:hidden"
          aria-label={menuOpen ? tCommon("menuClose") : tCommon("menuOpen")}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu overlay - debajo del navbar para que logo y botón mantengan posición */}
      {mounted &&
        createPortal(
          <div
            className={`fixed left-0 right-0 bottom-0 top-14 z-[9999] overflow-hidden nav:hidden ${
              menuOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}
            aria-hidden={!menuOpen}
          >
            {/* Backdrop con transición suave - clic cierra el menú */}
            <div
              role="button"
              tabIndex={-1}
              onClick={() => history.back()}
              onKeyDown={(e) => e.key === "Escape" && history.back()}
              className={`absolute inset-0 bg-punk-black/95 backdrop-blur-lg transition-opacity duration-300 ease-out ${
                menuOpen ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDuration: `${MENU_TRANSITION_MS}ms` }}
              aria-label={tCommon("menuClose")}
            />
            {/* Panel deslizante desde la derecha */}
            <div
              className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-punk-black shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                menuOpen ? "translate-x-0" : "translate-x-full"
              }`}
              style={{ transitionDuration: `${MENU_TRANSITION_MS}ms` }}
            >
              <div
                className={`flex h-full flex-col overflow-y-auto px-4 py-4 sm:px-6 transition-opacity duration-200 ${
                  menuOpen ? "opacity-100 delay-75" : "opacity-0 delay-0"
                }`}
              >
                <div className="mb-4 h-px bg-punk-red" />

                {/* Idioma en móvil */}
                {!isAdmin && (
                  <div className="mb-4 flex justify-end">
                    <LanguageSwitcher />
                  </div>
                )}

                {/* Nav links */}
                <nav className="flex flex-col gap-1 mt-2">
                  {navLinks.map((link) => {
                    if ("dropdown" in link) {
                      return (
                        <div
                          key={link.labelKey}
                          className="border-l-4 border-transparent"
                        >
                          <button
                            type="button"
                            onClick={() => setSceneMobileOpen(!sceneMobileOpen)}
                            className={`relative flex w-full items-center gap-2 rounded-r px-4 py-3 font-punch text-sm uppercase tracking-widest transition-colors hover:bg-punk-white/10 hover:text-punk-green ${
                              isEscenaActive(pathname)
                                ? "nav-link-active text-punk-red"
                                : "text-punk-white/90"
                            }`}
                            aria-expanded={sceneMobileOpen}
                          >
                            <img
                              src={MOBILE_NAV_ICONS[link.labelKey]}
                              alt=""
                              width={20}
                              height={20}
                              className="h-5 w-5 shrink-0 object-contain"
                              style={{
                                filter: isEscenaActive(pathname)
                                  ? "brightness(0) saturate(100%) invert(36%) sepia(100%) saturate(5000%) hue-rotate(310deg)"
                                  : "brightness(0) invert(1)",
                              }}
                            />
                            <span className="flex-1 text-center">
                              {t(link.labelKey)}
                            </span>
                            <span className="h-5 w-5 shrink-0" aria-hidden />
                            <ChevronDown
                              className={`absolute right-4 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 transition-transform duration-200 ${
                                sceneMobileOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          <div
                            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                              sceneMobileOpen
                                ? "grid-rows-[1fr]"
                                : "grid-rows-[0fr]"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="flex flex-col">
                                {(link.dropdown ?? []).map((sub) => {
                                  const subActive = isEscenaSubActive(
                                    pathname,
                                    sub.href,
                                  );
                                  return (
                                    <Link
                                      key={sub.href}
                                      href={sub.href}
                                      onClick={() => {
                                        setMenuOpen(false);
                                        setSceneMobileOpen(false);
                                      }}
                                      className={`flex w-full items-center gap-4 rounded-r pl-14 pr-16 py-3 font-punch text-sm uppercase tracking-widest transition-colors hover:bg-punk-white/10 hover:text-punk-green ${
                                        subActive
                                          ? "nav-link-active border-l-4 border-punk-red bg-punk-red/10 text-punk-red"
                                          : "border-l-4 border-transparent text-punk-white/90"
                                      }`}
                                    >
                                    <img
                                      src={MOBILE_NAV_ICONS[sub.labelKey]}
                                      alt=""
                                      width={18}
                                      height={18}
                                      className="h-[18px] w-[18px] shrink-0 object-contain"
                                      style={{
                                        filter: subActive
                                          ? "brightness(0) saturate(100%) invert(36%) sepia(100%) saturate(5000%) hue-rotate(310deg)"
                                          : "brightness(0) invert(1)",
                                      }}
                                    />
                                    <span className="flex-1 text-center">
                                      {t(sub.labelKey)}
                                    </span>
                                    <span className="h-[18px] w-[18px] shrink-0" aria-hidden />
                                  </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    const active = isActivePath(pathname, link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex w-full items-center gap-2 rounded px-4 py-3 font-punch text-sm uppercase tracking-widest transition-colors hover:bg-punk-white/10 hover:text-punk-green ${
                          active
                            ? "nav-link-active border-l-4 border-punk-red bg-punk-red/10 text-punk-red"
                            : "border-l-4 border-transparent text-punk-white/90"
                        }`}
                      >
                        <img
                          src={MOBILE_NAV_ICONS[link.labelKey]}
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 shrink-0 object-contain"
                          style={{
                            filter: active
                              ? "brightness(0) saturate(100%) invert(36%) sepia(100%) saturate(5000%) hue-rotate(310deg)"
                              : "brightness(0) invert(1)",
                          }}
                        />
                        <span className="flex-1 text-center">
                          {t(link.labelKey)}
                        </span>
                        <span className="h-5 w-5 shrink-0" aria-hidden />
                      </Link>
                    );
                  })}
                  {session && !EDITORIAL_MVP_MODE && (
                    <Link
                      href="/bolos"
                      onClick={() => setMenuOpen(false)}
                      className={`flex w-full items-center justify-center rounded px-4 py-3 font-punch text-sm uppercase tracking-widest transition-colors hover:bg-punk-white/10 hover:text-punk-green ${
                        isActivePath(pathname, "/bolos-nav")
                          ? "nav-link-active border-l-4 border-punk-red bg-punk-red/10 text-punk-red"
                          : "border-l-4 border-transparent text-punk-white/90"
                      }`}
                    >
                      <span className="flex-1 text-center">{t("bolos")}</span>
                    </Link>
                  )}
                  {(() => {
                    const guideLink = getGuideOrManualLink(session, t);
                    const active = isActivePath(pathname, guideLink.href);
                    return (
                      <Link
                        href={guideLink.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex w-full items-center gap-2 rounded px-4 py-3 font-punch text-sm uppercase tracking-widest transition-colors hover:bg-punk-white/10 hover:text-punk-green ${
                          active
                            ? "nav-link-active border-l-4 border-punk-red bg-punk-red/10 text-punk-red"
                            : "text-punk-white/90"
                        }`}
                      >
                        <img
                          src="/svg/flash2-svgrepo-com.svg"
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 shrink-0 object-contain"
                          style={{
                            filter: active
                              ? "brightness(0) saturate(100%) invert(36%) sepia(100%) saturate(5000%) hue-rotate(310deg)"
                              : "brightness(0) invert(1)",
                          }}
                        />
                        <span className="flex-1 text-center">
                          {guideLink.label}
                        </span>
                        <span className="h-5 w-5 shrink-0" aria-hidden />
                      </Link>
                    );
                  })()}
                  {session ? (
                    <>
                      <NextLink
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className={`mt-2 flex w-full items-center gap-2 rounded border-2 border-punk-green px-4 py-3 font-punch text-xs uppercase tracking-widest text-punk-white transition-colors hover:bg-transparent hover:text-punk-green ${
                          (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) &&
                          !(pathname === "/dashboard/buzon" || pathname.startsWith("/dashboard/buzon/"))
                            ? "bg-punk-green ring-2 ring-punk-white ring-offset-2 ring-offset-punk-black"
                            : "bg-punk-green"
                        }`}
                      >
                        <img
                          src="/svg/dashboard-svgrepo-com.svg"
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 shrink-0 object-contain"
                          style={{ filter: "brightness(0) invert(1)" }}
                        />
                        <span className="flex-1 text-center">{t("panel")}</span>
                        <span className="h-5 w-5 shrink-0" aria-hidden />
                    </NextLink>
                      <InboxBadge
                        variant="mobile-list"
                        onNavigate={() => setMenuOpen(false)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          signOut({
                            callbackUrl: locale === "eu" ? "/eu" : "/",
                          });
                        }}
                        className="mt-4 flex w-full items-center gap-2 rounded border-2 border-punk-red bg-punk-red px-4 py-3 font-punch text-xs uppercase tracking-widest text-punk-white transition-colors hover:bg-transparent hover:text-punk-red"
                      >
                        <img
                          src="/svg/logout-sketch-svgrepo-com.svg"
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 shrink-0 object-contain"
                          style={{ filter: "brightness(0) invert(1)" }}
                        />
                        <span className="flex-1 text-center">
                          {t("logout")}
                        </span>
                        <span className="h-5 w-5 shrink-0" aria-hidden />
                      </button>
                    </>
                  ) : (
                    <div className="mt-2 flex flex-col gap-2">
                      {!EDITORIAL_MVP_MODE && (
                        <Link
                          href="/auth/reclamar"
                          onClick={() => setMenuOpen(false)}
                          className="rounded border-2 border-punk-white/40 px-4 py-3 text-center font-punch text-xs uppercase tracking-widest text-punk-white/80 hover:border-punk-green hover:text-punk-green"
                        >
                          {t("claimProfile")}
                        </Link>
                      )}
                      <Link
                        href="/auth/login"
                        onClick={() => setMenuOpen(false)}
                        className="rounded border-2 border-punk-red px-4 py-3 text-center font-punch text-xs uppercase tracking-widest text-punk-red hover:bg-punk-red hover:text-punk-white"
                      >
                        {t("login")}
                      </Link>
                    </div>
                  )}
                  {/* Instalar app: solo visible cuando la PWA no está instalada */}
                  {!isPwaInstalled && (
                    <div className="mt-12 border-t-2 border-punk-white/20 pt-8">
                      <InstallAppButton
                        variant="menu"
                        onNavigate={() => setMenuOpen(false)}
                        isActive={
                          pathname === "/instalar" || pathname.endsWith("/instalar")
                        }
                      />
                    </div>
                  )}
                </nav>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
