import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrganizadorForm } from "./OrganizadorForm";

export default async function DashboardOrganizadorPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const organizer = await prisma.organizer.findFirst({
    where: { userId: session.user.id },
  });

  if (!organizer) {
    return (
      <div>
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          MI ORGANIZADOR
        </h1>
        <p className="mt-6 font-body text-punk-white/60">
          No tienes un organizador asociado.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
        MI ORGANIZADOR
      </h1>
      <p className="mt-2 font-body text-punk-white/60">
        {organizer.name}
        {!organizer.approved && (
          <span className="ml-2 rounded border border-punk-red/50 bg-punk-red/10 px-2 py-0.5 font-punch text-xs text-punk-red">
            Pendiente de aprobación
          </span>
        )}
      </p>
      <OrganizadorForm organizer={organizer} />
    </>
  );
}
