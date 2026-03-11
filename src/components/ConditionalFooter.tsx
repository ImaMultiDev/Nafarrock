"use client";

import { usePathname } from "@/i18n/navigation";
import { FooterSection } from "@/components/home/FooterSection";

export function ConditionalFooter() {
  const pathname = usePathname();
  const isMapPage = pathname === "/mapa" || pathname.endsWith("/mapa");
  const isEventosPage = pathname === "/eventos" || pathname.endsWith("/eventos");
  const isBandasPage = pathname === "/bandas" || pathname.endsWith("/bandas");
  const isSalasPage = pathname === "/salas" || pathname.endsWith("/salas");
  const isFestivalesPage = pathname === "/festivales" || pathname.endsWith("/festivales");
  const isTablonPage = pathname === "/tablon" || pathname.endsWith("/tablon");

  if (isMapPage || isEventosPage || isBandasPage || isSalasPage || isFestivalesPage || isTablonPage) return null;
  return <FooterSection />;
}
