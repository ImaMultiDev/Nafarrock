import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";

export const metadata = {
  title: "Guía",
  description:
    "Qué es Nafarrock: visibilidad, conciertos y bandas de la escena rock en Euskal Herria y Navarra",
};

export default function GuiaPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
          GUÍA
        </h1>
        <p className="mt-3 font-punch text-xs uppercase tracking-widest text-punk-red">
          Qué es Nafarrock
        </p>

        <article className="mt-10 space-y-8 font-body leading-relaxed">
          <section>
            <h2 className="font-display text-2xl tracking-tighter text-punk-white">
              Lo esencial
            </h2>
            <p className="mt-3 text-punk-white/90">
              <strong className="text-punk-red">Nafarrock</strong> es una plataforma cultural
              centrada en la escena rock: punk, hardcore, metal, indie y derivados en{" "}
              <strong className="text-punk-green">Euskal Herria</strong> y{" "}
              <strong className="text-punk-green">Navarra</strong>.
            </p>
            <p className="mt-4 text-punk-white/90">
              No somos un directorio institucional ni una agenda cultural genérica.
              Estamos aquí para dar <strong>visibilidad</strong>, <strong>foco</strong> y{" "}
              <strong>voz</strong> a lo que ocurre en la escena.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tighter text-punk-white">
              El núcleo
            </h2>
            <p className="mt-3 text-punk-white/90">
              Lo que nos mueve son tres cosas:
            </p>
            <ul className="mt-4 space-y-2 text-punk-white/90">
              <li className="flex gap-3">
                <span className="text-punk-red font-display">—</span>
                <span><strong>Los eventos</strong>: conciertos y festivales. Que sepas qué hay y dónde.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-punk-red font-display">—</span>
                <span><strong>Las bandas</strong>: quiénes suenan, quiénes tocan, quiénes molan.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-punk-red font-display">—</span>
                <span><strong>La escena viva</strong>: promotores, organizadores, festivales y salas que hacen posible que todo esto ocurra.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tighter text-punk-white">
              Para qué sirve Nafarrock
            </h2>
            <ul className="mt-4 space-y-2 text-punk-white/90">
              <li className="flex gap-3">
                <span className="text-punk-green font-display">·</span>
                <span><strong>Visibilizar</strong> lo que sucede: conciertos, bandas, espacios.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-punk-green font-display">·</span>
                <span><strong>Conectar</strong> a la escena: público, bandas, espacios, promotores.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-punk-green font-display">·</span>
                <span><strong>Servir de altavoz</strong> cultural: rock, punk, metal y lo que venga.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tighter text-punk-white">
              Dónde estamos
            </h2>
            <p className="mt-3 text-punk-white/90">
              Nos centramos en <strong>Euskal Herria</strong> y <strong>Navarra</strong>.
              Es el territorio donde vive la escena que queremos apoyar.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl tracking-tighter text-punk-white">
              Cómo empezar
            </h2>
            <p className="mt-3 text-punk-white/90">
              Entra en <Link href="/eventos" className="text-punk-red hover:underline">Eventos</Link> para
              ver conciertos y festivales. Explora <Link href="/bandas" className="text-punk-green hover:underline">Bandas</Link> para
              descubrir quién toca. Y pasa por la <Link href="/escena" className="text-punk-pink hover:underline">Escena</Link> para
              ver salas, promotores, organizadores y festivales.
            </p>
          </section>

          <div className="mt-12 border-t-2 border-punk-white/10 pt-8">
            <p className="font-punch text-xs uppercase tracking-widest text-punk-white/60">
              Plataforma cultural · Escena rock · Euskal Herria · Navarra
            </p>
          </div>
        </article>
      </div>
    </PageLayout>
  );
}
