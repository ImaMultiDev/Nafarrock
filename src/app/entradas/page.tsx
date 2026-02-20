import { redirect } from "next/navigation";

/** Redirigir /entradas a /eventos (contenido unificado) */
export default function EntradasPage() {
  redirect("/eventos");
}
