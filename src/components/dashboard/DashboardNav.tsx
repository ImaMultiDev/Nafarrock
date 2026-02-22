"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Calendar,
  Music2,
  Megaphone,
  Building2,
  PartyPopper,
  Sparkles,
  FilePlus,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: "dashboard" | "perfil" | "eventos" | "banda" | "sala" | "festival" | "promotor" | "organizador" | "anuncio";
  accent?: "green" | "pink" | "red" | "yellow";
};

const ICONS = {
  dashboard: LayoutDashboard,
  perfil: User,
  eventos: Calendar,
  banda: Music2,
  sala: Building2,
  festival: PartyPopper,
  promotor: Megaphone,
  organizador: Sparkles,
  anuncio: FilePlus,
};

const ACCENT_STYLES = {
  green: "border-punk-green/60 text-punk-green hover:bg-punk-green/10 data-[active=true]:border-punk-green data-[active=true]:bg-punk-green/15 data-[active=true]:text-punk-green",
  pink: "border-punk-pink/60 text-punk-pink hover:bg-punk-pink/10 data-[active=true]:border-punk-pink data-[active=true]:bg-punk-pink/15 data-[active=true]:text-punk-pink",
  red: "border-punk-red/60 text-punk-red hover:bg-punk-red/10 data-[active=true]:border-punk-red data-[active=true]:bg-punk-red/15 data-[active=true]:text-punk-red",
  yellow: "border-punk-yellow/60 text-punk-yellow hover:bg-punk-yellow/10 data-[active=true]:border-punk-yellow data-[active=true]:bg-punk-yellow/15 data-[active=true]:text-punk-yellow",
};

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navLinks = items.map((item) => {
    const Icon = ICONS[item.icon];
    const accent = item.accent ?? "green";
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        data-active={active}
        className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 font-punch text-sm uppercase tracking-widest transition-all ${ACCENT_STYLES[accent]}`}
      >
        <Icon size={20} className="shrink-0" />
        <span>{item.label}</span>
      </Link>
    );
  });

  return (
    <>
      {/* Desktop: sidebar */}
      <aside className="hidden lg:flex lg:w-56 lg:shrink-0 lg:flex-col">
        <nav className="flex flex-col gap-2 rounded-xl border-2 border-punk-white/10 bg-punk-black/60 p-4 backdrop-blur-sm">
          {navLinks}
        </nav>
      </aside>

      {/* Mobile: botones que envuelven en varias filas */}
      <div className="mb-6 flex flex-wrap gap-2 lg:hidden">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const accent = item.accent ?? "green";
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border-2 px-3 py-2 font-punch text-[11px] uppercase tracking-widest transition-all sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs ${ACCENT_STYLES[accent]}`}
            >
              <Icon size={14} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

