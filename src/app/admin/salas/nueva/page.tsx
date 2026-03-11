import { VenueForm } from "./VenueForm";

export default function NuevaSalaPage() {
  return (
    <>
      <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
        Registrar espacio
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        Crear espacio como admin (visible de inmediato)
      </p>
      <VenueForm />
    </>
  );
}
