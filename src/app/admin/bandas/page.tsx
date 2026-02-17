import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminBandasPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") redirect("/auth/login");

  const bands = await prisma.band.findMany({
    orderBy: { name: "asc" },
    include: { user: { select: { email: true } } },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-void-50">
        Gestión de bandas
      </h1>
      <p className="mt-2 text-void-400">{bands.length} bandas</p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-void-700">
              <th className="py-3 text-void-400">Nombre</th>
              <th className="py-3 text-void-400">Estado</th>
              <th className="py-3 text-void-400">Aprobada</th>
            </tr>
          </thead>
          <tbody>
            {bands.map((b) => (
              <tr key={b.id} className="border-b border-void-800">
                <td className="py-3 text-void-100">{b.name}</td>
                <td className="py-3">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      b.approved ? "bg-green-900/50 text-green-400" : "bg-void-700 text-void-400"
                    }`}
                  >
                    {b.approved ? "Aprobada" : "Pendiente"}
                  </span>
                </td>
                <td className="py-3 text-void-500 text-sm">{b.user?.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-sm text-void-500">
        CRUD completo pendiente de implementar. Esta vista muestra el listado.
      </p>
    </main>
  );
}
