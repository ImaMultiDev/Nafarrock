import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { InboxList } from "./InboxList";
import { Inbox } from "lucide-react";

export default async function BuzonPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const t = await getTranslations("dashboard.inbox");

  const messages = await prisma.inboxMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-punk-white/10 bg-punk-black/40 py-16">
          <Inbox size={48} className="text-punk-white/30" />
          <p className="mt-4 font-body text-punk-white/50">
            {t("empty")}
          </p>
          <p className="mt-1 font-body text-sm text-punk-white/40">
            {t("emptyHint")}
          </p>
        </div>
      ) : (
        <InboxList messages={messages} />
      )}
    </>
  );
}
