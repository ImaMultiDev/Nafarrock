"use client";

import { usePathname } from "@/i18n/navigation";
import { FooterSection } from "@/components/home/FooterSection";

export function ConditionalFooter() {
  const pathname = usePathname();
  const isMapPage = pathname === "/mapa" || pathname.startsWith("/mapa");
  const isEventosListPage = pathname === "/eventos" || pathname.endsWith("/eventos");
  const isBandasListPage = pathname === "/bandas" || pathname.endsWith("/bandas");
  const isSalasListPage = pathname === "/salas" || pathname.endsWith("/salas");
  const isFestivalesListPage = pathname === "/festivales" || pathname.endsWith("/festivales");
  const isTablonListPage = pathname === "/tablon" || pathname.endsWith("/tablon");

  if (isMapPage || isEventosListPage || isBandasListPage || isSalasListPage || isFestivalesListPage || isTablonListPage) return null;
  return <FooterSection />;
}
