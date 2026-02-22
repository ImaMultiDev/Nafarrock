import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { ClaimSearchForm } from "./ClaimSearchForm";
import { ClaimTypeSelector } from "./ClaimTypeSelector";

export const metadata = {
  title: "Reclamar perfil",
  description: "Reclama tu perfil de banda, sala o festival en Nafarrock",
};

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ReclamarPage({ searchParams }: Props) {
  const params = await searchParams;
  const type = (params.type as "BAND" | "VENUE" | "FESTIVAL") || undefined;

  return (
    <PageLayout>
      <Link
        href="/auth/login"
        className="font-punch text-xs uppercase tracking-widest text-punk-green hover:text-punk-green/80"
      >
        ← Volver a Entrar / Registrarse
      </Link>
      <h1 className="mt-6 font-display text-5xl tracking-tighter text-punk-white sm:text-6xl">
        RECLAMAR
      </h1>
      <p className="mt-3 max-w-xl font-body text-punk-white/60">
        Si tu banda, sala o festival ya aparece en Nafarrock (creado por el equipo),
        puedes reclamarlo para gestionarlo tú mismo.
      </p>

      <ClaimTypeSelector selectedType={type} />

      {type ? (
        <ClaimSearchForm type={type} />
      ) : (
        <p className="mt-8 font-body text-punk-white/50">
          Selecciona el tipo de perfil que quieres reclamar.
        </p>
      )}
    </PageLayout>
  );
}
