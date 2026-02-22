import { RegisterForm } from "./RegisterForm";

export const metadata = {
  title: "Registro",
  description: "Regístrate en Nafarrock como usuario, banda, sala, festival, promotor u organizador",
};

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function RegistroPage({ searchParams }: Props) {
  const params = await searchParams;
  const claimType = params.claim as "BAND" | "VENUE" | "FESTIVAL" | undefined;
  const claimId = params.claimId;
  const claimName = params.claimName;

  return (
    <RegisterForm
      claimType={claimType}
      claimId={claimId ?? undefined}
      claimName={claimName ?? undefined}
    />
  );
}
