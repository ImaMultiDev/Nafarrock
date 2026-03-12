"use client";

import { usePathname } from "@/i18n/navigation";
import { FooterSection } from "@/components/home/FooterSection";

export function ConditionalFooter() {
  const pathname = usePathname();
  const isMapPage = pathname === "/mapa" || pathname.startsWith("/mapa");
  const isEventosPage = pathname.startsWith("/eventos");
  const isBandasPage = pathname.startsWith("/bandas");
  const isSalasPage = pathname.startsWith("/salas");
  const isFestivalesPage = pathname.startsWith("/festivales");
  const isTablonPage = pathname.startsWith("/tablon");

  if (isMapPage || isEventosPage || isBandasPage || isSalasPage || isFestivalesPage || isTablonPage) return null;
  return <FooterSection />;
}
