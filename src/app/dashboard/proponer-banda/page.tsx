import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BandProposalForm } from "./BandProposalForm";

const GENRES = [
  "punk",
  "rock urbano",
  "grunge",
  "hardcore",
  "indie",
  "alternativo",
  "metal",
];

export default async function ProponerBandaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          Proponer banda
        </h1>
        <p className="mt-2 font-body text-punk-white/60">
          Sugiere una banda para el radar cultural. El administrador revisará tu
          propuesta antes de publicarla.
        </p>
      </div>
      <BandProposalForm genres={GENRES} />
    </>
  );
}
