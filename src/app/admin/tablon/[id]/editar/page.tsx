import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { BoardAnnouncementEditForm } from "./BoardAnnouncementEditForm";

export default async function EditarAnuncioTablonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const announcement = await prisma.boardAnnouncement.findUnique({
    where: { id },
  });
  if (!announcement) notFound();

  return (
    <>
      <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
        Editar anuncio
      </h1>
      <p className="mt-2 font-body text-punk-white/60">{announcement.title}</p>
      <BoardAnnouncementEditForm announcement={announcement} />
    </>
  );
}
