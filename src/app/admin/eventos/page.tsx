import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminEventosPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") redirect("/auth/login");

  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    include: { venue: true },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-void-50">
        Gestión de eventos
      </h1>
      <p className="mt-2 text-void-400">{events.length} eventos</p>
      <div className="mt-8 space-y-4">
        {events.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between rounded border border-void-800 p-4"
          >
            <div>
              <span className="font-medium text-void-100">{e.title}</span>
              <span className="ml-2 text-void-500">· {e.venue.name}</span>
            </div>
            <span
              className={`rounded px-2 py-1 text-xs ${
                e.isApproved ? "bg-green-900/50 text-green-400" : "bg-void-700 text-void-400"
              }`}
            >
              {e.isApproved ? "Aprobado" : "Pendiente"}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
