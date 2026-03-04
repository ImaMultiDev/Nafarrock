import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";

export const metadata = {
  title: "Acceso restringido",
  description: "Esta sección es solo para bandas, salas y festivales de la escena",
};

export default function AccesoEscenaPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-xl border-2 border-punk-white/20 bg-punk-black p-8 text-center">
        <h1 className="font-display text-3xl tracking-tighter text-punk-white sm:text-4xl">
          Acceso restringido
        </h1>
        <p className="mt-4 font-body text-punk-white/70">
          Los listados de promotores, organizadores y asociaciones son solo visibles para bandas, salas y festivales de la escena. Si tienes un perfil profesional, inicia sesión.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/auth/login"
            className="border-2 border-punk-pink bg-punk-pink px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-black transition-all hover:bg-punk-pink/90"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/escena"
            className="border-2 border-punk-white/30 px-6 py-3 font-punch text-sm uppercase tracking-widest text-punk-white/70 transition-all hover:border-punk-white"
          >
            Volver a Escena
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
