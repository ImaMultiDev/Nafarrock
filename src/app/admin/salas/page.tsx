import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminSalasPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") redirect("/auth/login");

  const venues = await prisma.venue.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-void-50">
        Gestión de salas
      </h1>
      <p className="mt-2 text-void-400">{venues.length} salas</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((v) => (
          <div
            key={v.id}
            className="rounded border border-void-800 p-4"
          >
            <span className="font-medium text-void-100">{v.name}</span>
            <p className="mt-1 text-sm text-void-500">{v.city}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
