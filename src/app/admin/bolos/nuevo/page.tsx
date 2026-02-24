import { AdminAnnouncementForm } from "./AdminAnnouncementForm";

export default function AdminNuevoBoloPage() {
  return (
    <>
      <div>
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
          CREAR ANUNCIO
        </h1>
        <p className="mt-2 font-body text-punk-white/60">
          Publica un anuncio en nombre de Nafarrock. Aparecerá como &quot;PUBLICADO POR NAFARROCK&quot;.
        </p>
      </div>
      <AdminAnnouncementForm />
    </>
  );
}
