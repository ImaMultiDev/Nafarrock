import Link from "next/link";

const EDITORIAL_MVP_MODE = true;

export default function AdminPage() {
  return (
    <>
      <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
        ADMIN
      </h1>
      <p className="mt-3 font-body text-punk-white/60">
        Moderación del radar cultural: bandas, eventos, salas y propuestas de usuarios
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/bandas"
          className="block border-2 border-punk-green bg-punk-black p-6 transition-all hover:border-punk-green hover:shadow-[0_0_30px_rgba(0,200,83,0.2)]"
        >
          <h2 className="font-display text-xl tracking-tighter text-punk-green">
            Bandas
          </h2>
          <p className="mt-2 font-body text-sm text-punk-white/70">
            Gestionar y aprobar bandas
          </p>
        </Link>
        <Link
          href="/admin/eventos"
          className="block border-2 border-punk-red bg-punk-black p-6 transition-all hover:border-punk-red hover:shadow-[0_0_30px_rgba(230,0,38,0.2)]"
        >
          <h2 className="font-display text-xl tracking-tighter text-punk-red">
            Eventos
          </h2>
          <p className="mt-2 font-body text-sm text-punk-white/70">
            Eventos de la agenda
          </p>
        </Link>
        <Link
          href="/admin/salas"
          className="block border-2 border-punk-pink bg-punk-black p-6 transition-all hover:border-punk-pink hover:shadow-[0_0_30px_rgba(255,0,110,0.2)]"
        >
          <h2 className="font-display text-xl tracking-tighter text-punk-pink">
            Salas
          </h2>
          <p className="mt-2 font-body text-sm text-punk-white/70">
            Espacios y venues
          </p>
        </Link>
        <Link
          href="/admin/usuarios"
          className="block border-2 border-punk-acid bg-punk-black p-6 transition-all hover:border-punk-acid hover:shadow-[0_0_30px_rgba(200,255,0,0.2)]"
        >
          <h2 className="font-display text-xl tracking-tighter text-punk-acid">
            Usuarios
          </h2>
          <p className="mt-2 font-body text-sm text-punk-white/70">
            Cuentas registradas del radar
          </p>
        </Link>
        <Link
          href="/admin/bolos"
          className="block border-2 border-punk-green/50 bg-punk-black p-6 transition-all hover:border-punk-green hover:shadow-[0_0_30px_rgba(0,200,83,0.2)]"
        >
          <h2 className="font-display text-xl tracking-tighter text-punk-green">
            Anuncios / Bolos
          </h2>
          <p className="mt-2 font-body text-sm text-punk-white/70">
            Moderar anuncios de oportunidades
          </p>
        </Link>
        <Link
          href="/admin/solicitudes"
          className="block border-2 border-punk-yellow/50 bg-punk-black p-6 transition-all hover:border-punk-yellow hover:shadow-[0_0_30px_rgba(255,214,10,0.2)]"
        >
          <h2 className="font-display text-xl tracking-tighter text-punk-yellow">
            Solicitudes
          </h2>
          <p className="mt-2 font-body text-sm text-punk-white/70">
            Bandas y eventos propuestos por usuarios
          </p>
        </Link>
        {!EDITORIAL_MVP_MODE && (
          <Link
            href="/admin/reclamaciones"
            className="block border-2 border-punk-acid/50 bg-punk-black p-6 transition-all hover:border-punk-acid hover:shadow-[0_0_30px_rgba(200,255,0,0.2)]"
          >
            <h2 className="font-display text-xl tracking-tighter text-punk-acid">
              Reclamaciones
            </h2>
            <p className="mt-2 font-body text-sm text-punk-white/70">
              Solicitudes de reclamación de perfiles
            </p>
          </Link>
        )}
      </div>
    </>
  );
}
