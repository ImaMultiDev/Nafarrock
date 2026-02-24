import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canUserAccessContact } from "@/lib/contact-access";
import { redirect } from "next/navigation";
import { PageLayout } from "@/components/ui/PageLayout";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Contacto",
  description: "Formulario de contacto con el administrador de Nafarrock",
};

export default async function ContactoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/contacto");
  }

  const access = await canUserAccessContact(session.user.id);
  if (!access.canAccess) {
    return (
      <PageLayout>
        <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
          Contacto
        </h1>
        <div className="mt-8 max-w-xl border-2 border-punk-red/50 bg-punk-red/10 p-6">
          <p className="font-body text-punk-white/90">{access.reason}</p>
          <p className="mt-4 font-body text-sm text-punk-white/60">
            Si crees que es un error, inicia sesión con la cuenta correcta o contacta por otro medio.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <h1 className="font-display text-4xl tracking-tighter text-punk-white sm:text-5xl">
        Contacto
      </h1>
      <p className="mt-2 max-w-xl font-body text-punk-white/60">
        Usa este formulario para ponerte en contacto con el administrador de Nafarrock.
        Los mensajes se envían a{" "}
        <a
          href="mailto:central@nafarrock.com"
          className="text-punk-green hover:underline"
        >
          central@nafarrock.com
        </a>
        .
      </p>
      <ContactForm
        defaultEmail={access.userEmail}
        defaultName={access.entityName ?? access.userName}
        role={access.role}
      />
    </PageLayout>
  );
}
