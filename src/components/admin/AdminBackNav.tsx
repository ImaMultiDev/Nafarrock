"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminBackNav() {
  const pathname = usePathname();
  const path = pathname.replace(/^\/admin\/?/, "");
  const segments = path.split("/").filter(Boolean);

  let backHref: string;
  if (path === "") {
    backHref = "/dashboard";
  } else if (segments.length === 1) {
    // /admin/bandas, /admin/eventos, etc.
    backHref = "/admin";
  } else {
    // /admin/bandas/nueva, /admin/bandas/[id]/editar, /admin/bolos/[id]
    const removeCount = segments[segments.length - 1] === "editar" ? 2 : 1;
    const parentSegments = segments.slice(0, -removeCount);
    backHref = parentSegments.length > 0 ? `/admin/${parentSegments.join("/")}` : "/admin";
  }

  return (
    <Link
      href={backHref}
      className="font-punch text-xs uppercase tracking-widest text-punk-green hover:text-punk-green/80"
    >
      ← Volver
    </Link>
  );
}
