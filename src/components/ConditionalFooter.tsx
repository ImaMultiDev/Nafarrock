"use client";

import { usePathname } from "@/i18n/navigation";
import { FooterSection } from "@/components/home/FooterSection";

export function ConditionalFooter() {
  const pathname = usePathname();
  const isMapPage = pathname === "/mapa" || pathname.endsWith("/mapa");

  if (isMapPage) return null;
  return <FooterSection />;
}
