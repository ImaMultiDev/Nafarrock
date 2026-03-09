import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { EventProposalForm } from "./EventProposalForm";

export default async function ProponerEventoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const t = await getTranslations("dashboard.proposals.event");

  const bands = await prisma.band.findMany({
    orderBy: { name: "asc" },
    where: { approved: true },
    select: { id: true, name: true },
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-2 font-body text-punk-white/60">
          {t("subtitle")}
        </p>
      </div>
      <EventProposalForm bands={bands} />
    </>
  );
}
