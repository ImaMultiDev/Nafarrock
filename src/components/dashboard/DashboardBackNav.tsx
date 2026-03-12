"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function DashboardBackNav() {
  const pathname = usePathname();
  const t = useTranslations("dashboard");
  const path = pathname.replace(/^\/dashboard\/?/, "");
  const segments = path.split("/").filter(Boolean);

  if (path === "") return null; // En /dashboard no mostrar Volver

  let backHref: string;
  if (segments.length === 1) {
    // /dashboard/perfil, /dashboard/banda, etc.
    backHref = "/dashboard";
  } else {
    // /dashboard/eventos/[id]/editar, /dashboard/bolos/nuevo
    const removeCount = segments[segments.length - 1] === "editar" ? 2 : 1;
    const parentSegments = segments.slice(0, -removeCount);
    backHref = parentSegments.length > 0 ? `/dashboard/${parentSegments.join("/")}` : "/dashboard";
  }

  const isPerfil = pathname.includes("/dashboard/perfil");
  const isBuzon = pathname.includes("/dashboard/buzon");
  const isProponerBanda = pathname.includes("/dashboard/proponer-banda");
  const isProponerEvento = pathname.includes("/dashboard/proponer-evento");
  const isProponerAnuncio = pathname.includes("/dashboard/proponer-anuncio");
  const hideOnMobile =
    isPerfil ||
    isBuzon ||
    isProponerBanda ||
    isProponerEvento ||
    isProponerAnuncio;

  return (
    <Link
      href={backHref}
      className={`mb-6 block font-punch text-xs uppercase tracking-widest text-punk-green hover:text-punk-green/80 ${hideOnMobile ? "hidden lg:block" : ""}`}
    >
      {t("back")}
    </Link>
  );
}
