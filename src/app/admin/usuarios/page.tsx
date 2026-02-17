import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminUsuariosPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") redirect("/auth/login");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-void-50">
        Gestión de usuarios
      </h1>
      <p className="mt-2 text-void-400">{users.length} usuarios</p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-void-700">
              <th className="py-3 text-void-400">Email</th>
              <th className="py-3 text-void-400">Nombre</th>
              <th className="py-3 text-void-400">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-void-800">
                <td className="py-3 text-void-100">{u.email}</td>
                <td className="py-3 text-void-400">{u.name ?? "-"}</td>
                <td className="py-3">
                  <span className="rounded bg-void-700 px-2 py-1 text-xs text-void-300">
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
