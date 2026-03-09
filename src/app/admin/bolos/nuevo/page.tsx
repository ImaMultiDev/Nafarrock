import { AdminBoardAnnouncementForm } from "./AdminBoardAnnouncementForm";

export default function AdminNuevoBoloPage() {
  return (
    <>
      <div>
        <h1 className="font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
          CREAR ANUNCIO
        </h1>
        <p className="mt-2 font-body text-punk-white/60">
          El anuncio se publicará directamente en la página pública de ANUNCIOS.
        </p>
      </div>
      <AdminBoardAnnouncementForm />
    </>
  );
}
