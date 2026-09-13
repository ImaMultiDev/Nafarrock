import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { EgunerokoSariaGame } from "@/components/premium/EgunerokoSariaGame";

export async function generateMetadata() {
  const t = await getTranslations("premium.egunerokoSaria");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

/**
 * Sorteo diario Premium — de momento solo administradores (sin límite de jugadas).
 */
export default async function EgunerokoSariaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <EgunerokoSariaGame adminUnlimited />;
}
