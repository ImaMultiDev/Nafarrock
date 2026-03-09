import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BoardAnnouncementForm } from "./BoardAnnouncementForm";

export default async function ProponerAnuncioPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const t = await getTranslations("boardAnnouncement.propose");

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-2 font-body text-punk-white/60">{t("subtitle")}</p>
      </div>
      <BoardAnnouncementForm />
    </>
  );
}
