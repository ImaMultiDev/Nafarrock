"use client";

import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Instagram,
  Mail,
  Facebook,
  Youtube,
  Music2,
} from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/social-links";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/bandas", label: "Bandas" },
  { href: "/eventos", label: "Eventos" },
  { href: "/festivales", label: "Festivales" },
  { href: "/salas", label: "Salas" },
  { href: "/promotores", label: "Promotores" },
  { href: "/organizadores", label: "Organizadores" },
  { href: "/buscar", label: "Buscar" },
];

function SocialIcon({ icon, className }: { icon: string; className?: string }) {
  const iconProps = { className, size: 20 };
  switch (icon) {
    case "instagram":
      return <Instagram {...iconProps} />;
    case "facebook":
      return <Facebook {...iconProps} />;
    case "youtube":
      return <Youtube {...iconProps} />;
    case "spotify":
      return <Music2 {...iconProps} />;
    case "mail":
      return <Mail {...iconProps} />;
    default:
      return <Mail {...iconProps} />;
  }
}

export function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-punk-red bg-punk-black/95 backdrop-blur-md">
      <nav className="relative flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-12">
        {/* Logo a la izquierda + NAFARROCK centrado y más grande en mobile */}
        <div className="flex flex-1 items-center md:flex-initial">
          <Link
            href="/"
            className="flex shrink-0 items-center transition-opacity hover:opacity-90"
          >
            <Image
              src="/logo.png"
              alt="Nafarrock - Guía del rock en Nafarroa"
              width={64}
              height={64}
              className="h-10 w-auto sm:h-12"
              priority
            />
          </Link>
          <Link
            href="/"
            className="flex flex-1 justify-center py-2 transition-opacity hover:opacity-90 md:ml-3 md:flex-initial md:justify-start"
          >
            <span className="font-display text-3xl text-punk-red tracking-tighter sm:text-4xl md:text-xl lg:text-4xl">
              NAFAR<span className="text-punk-green">ROCK</span>
            </span>
          </Link>
        </div>

        {/* Desktop: nav + redes + auth */}
        <div className="hidden items-center gap-4 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-punch text-xs uppercase tracking-widest text-punk-white/80 transition-colors hover:text-punk-green"
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-4 flex items-center gap-1 border-l border-punk-white/20 pl-4">
            {SOCIAL_LINKS.slice(0, 5).map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-punk-white/30 text-punk-white/80 transition-colors hover:border-punk-green hover:text-punk-green"
                aria-label={social.name}
              >
                <SocialIcon icon={social.icon} />
              </a>
            ))}
          </div>
          {session ? (
            <Link
              href="/dashboard"
              className="ml-2 border-2 border-punk-red bg-punk-red px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white transition-colors hover:bg-transparent hover:text-punk-red"
            >
              Panel
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="ml-2 border-2 border-punk-red bg-punk-red px-4 py-2 font-punch text-xs uppercase tracking-widest text-punk-white transition-colors hover:bg-transparent hover:text-punk-red"
            >
              Entrar
            </Link>
          )}
        </div>

        {/* Mobile: hamburger - absoluto a la derecha para que logo quede centrado */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="absolute right-4 top-1/2 flex h-10 w-10 shrink-0 -translate-y-1/2 items-center justify-center rounded border border-punk-white/30 text-punk-white md:relative md:right-0 md:top-0 md:translate-y-0 md:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu overlay - debajo del navbar para que logo y botón mantengan posición */}
      {mounted &&
        createPortal(
          <div
            className={`fixed left-0 right-0 bottom-0 top-16 z-[9999] bg-punk-black backdrop-blur-lg transition-opacity duration-300 md:hidden ${
              menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={!menuOpen}
          >
            <div className="flex h-full flex-col overflow-y-auto px-4 py-4 sm:px-6">
              <div className="mb-4 h-px bg-punk-red" />

              {/* Nav links */}
              <nav className="flex flex-col gap-1 mt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded px-4 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/90 transition-colors hover:bg-punk-white/10 hover:text-punk-green"
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded border-2 border-punk-red bg-punk-red px-4 py-3 text-center font-punch text-xs uppercase tracking-widest text-punk-white"
              >
                Panel
              </Link>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded border-2 border-punk-red px-4 py-3 text-center font-punch text-xs uppercase tracking-widest text-punk-red hover:bg-punk-red hover:text-punk-white"
              >
                Entrar
              </Link>
            )}
          </nav>

          <div className="my-6 h-px bg-punk-white/20" />

          {/* REDES */}
          <p className="mb-3 font-punch text-xs uppercase tracking-widest text-punk-white/50">
            Redes
          </p>
          <div className="flex flex-col gap-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded px-4 py-3 text-punk-white/80 transition-colors hover:bg-punk-white/5 hover:text-punk-green"
              >
                <SocialIcon icon={social.icon} className="shrink-0" />
                <span>{social.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>,
          document.body
        )}
    </header>
  );
}
