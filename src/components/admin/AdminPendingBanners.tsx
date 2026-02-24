import Link from "next/link";
import { getAdminPendingCounts } from "@/lib/admin-pending";

export async function AdminPendingBanners() {
  const { solicitudes, reclamaciones } = await getAdminPendingCounts();

  if (solicitudes === 0 && reclamaciones === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-2">
      {solicitudes > 0 && (
        <Link
          href="/admin/solicitudes"
          className="block w-full border-b border-punk-yellow/40 bg-punk-yellow/10 px-4 py-2.5 text-center font-body text-sm text-punk-white/90 transition-colors hover:bg-punk-yellow/20 sm:px-6 lg:px-12"
        >
          <span className="font-semibold text-punk-yellow">
            {solicitudes} solicitud{solicitudes !== 1 ? "es" : ""} pendiente{solicitudes !== 1 ? "s" : ""}
          </span>{" "}
          de aprobación de perfiles ·{" "}
          <span className="underline">Revisar</span>
        </Link>
      )}
      {reclamaciones > 0 && (
        <Link
          href="/admin/reclamaciones"
          className="block w-full border-b border-punk-acid/40 bg-punk-acid/10 px-4 py-2.5 text-center font-body text-sm text-punk-white/90 transition-colors hover:bg-punk-acid/20 sm:px-6 lg:px-12"
        >
          <span className="font-semibold text-punk-acid">
            {reclamaciones} reclamación{reclamaciones !== 1 ? "es" : ""} pendiente{reclamaciones !== 1 ? "s" : ""}
          </span>{" "}
          de perfiles ·{" "}
          <span className="underline">Revisar</span>
        </Link>
      )}
    </div>
  );
}
