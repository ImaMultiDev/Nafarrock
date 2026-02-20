import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import { PageLayout } from "@/components/ui/PageLayout";
import { MarkdownContent } from "@/components/ui/MarkdownContent";

const SLUG_TO_MANUAL: Record<string, string> = {
  banda: "MANUAL_BANDA",
  sala: "MANUAL_SALA",
  festival: "MANUAL_FESTIVAL",
  promotor: "MANUAL_PROMOTOR",
  organizador: "MANUAL_ORGANIZADOR",
  admin: "MANUAL_ADMIN",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ rol: string }>;
}) {
  const { rol } = await params;
  const manualName = SLUG_TO_MANUAL[rol.toLowerCase()];
  return {
    title: manualName ? `Manual ${rol}` : "Manual",
    description: `Guía de uso para tu perfil en Nafarrock`,
  };
}

export default async function ManualPage({
  params,
}: {
  params: Promise<{ rol: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/guia");
  }

  const { rol } = await params;
  const rolSlug = rol.toLowerCase();
  const userRole = session.user?.role as string;

  // Verificar que el usuario tiene permiso para ver este manual
  const roleMapping: Record<string, string> = {
    BANDA: "banda",
    SALA: "sala",
    FESTIVAL: "festival",
    PROMOTOR: "promotor",
    ORGANIZADOR: "organizador",
    ADMIN: "admin",
  };
  const allowedSlug = roleMapping[userRole];
  if (!allowedSlug) {
    redirect("/guia");
  }
  if (allowedSlug !== rolSlug) {
    redirect(`/manual/${allowedSlug}`);
  }

  const manualFile = SLUG_TO_MANUAL[rolSlug];
  if (!manualFile) {
    redirect("/guia");
  }

  let content: string;
  try {
    const filePath = join(process.cwd(), "docs", "manuales", `${manualFile}.md`);
    content = await readFile(filePath, "utf-8");
  } catch {
    redirect("/guia");
  }

  const titles: Record<string, string> = {
    banda: "Manual de Banda",
    sala: "Manual de Sala",
    festival: "Manual de Festival",
    promotor: "Manual de Promotor",
    organizador: "Manual de Organizador",
    admin: "Manual de Admin",
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          {titles[rolSlug] ?? "Manual"}
        </h1>
        <p className="mt-2 font-punch text-xs uppercase tracking-widest text-punk-white/60">
          Guía para tu perfil en Nafarrock
        </p>
        <div className="mt-10">
          <MarkdownContent content={content} />
        </div>
      </div>
    </PageLayout>
  );
}
