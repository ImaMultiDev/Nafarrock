"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  href: string;
  svgSrc: string;
  title: string;
  description: string;
  accent: string;
  accessLabel: string;
  accentColor?: "pink" | "yellow" | "green" | "red" | "white";
};

const ACCENT_COLORS: Record<string, string> = {
  pink: "text-punk-pink",
  yellow: "text-punk-yellow",
  green: "text-punk-green",
  red: "text-punk-red",
  white: "text-punk-white",
};

export function DashboardCard({
  href,
  svgSrc,
  title,
  description,
  accent,
  accessLabel,
  accentColor = "white",
}: Props) {
  const colorClass = ACCENT_COLORS[accentColor] ?? "text-punk-white";

  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-xl border-2 bg-gradient-to-br p-4 transition-all duration-200 md:p-6 ${accent}`}
    >
      {/* Mobile: icon left, title+desc right. Desktop: icon top, title, desc */}
      <div className="flex flex-1 flex-row items-start gap-4 md:flex-col md:gap-0">
        <span className="relative flex h-10 w-10 shrink-0 md:mt-0">
          <img
            src={svgSrc}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain opacity-80"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-semibold text-punk-white md:mt-4 md:text-lg">
            {title}
          </h2>
          <p className="mt-1 text-sm text-punk-white/60 md:mt-2 md:flex-1">
            {description}
          </p>
        </div>
      </div>
      <span
        className={`mt-3 inline-flex items-center gap-2 font-punch text-xs uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100 md:mt-4 ${colorClass}`}
      >
        {accessLabel} <ArrowRight size={14} />
      </span>
    </Link>
  );
}
