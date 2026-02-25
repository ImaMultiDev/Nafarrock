"use client";

import { useSession } from "next-auth/react";

const ROLES_NEEDING_APPROVAL = ["BANDA", "SALA", "FESTIVAL", "ASOCIACION", "PROMOTOR", "ORGANIZADOR"] as const;

export function BandVerificationBanner() {
  const { data: session } = useSession();

  const needsApproval =
    session?.user?.role &&
    ROLES_NEEDING_APPROVAL.includes(session.user.role as (typeof ROLES_NEEDING_APPROVAL)[number]) &&
    !session?.user?.profileApproved &&
    !session?.user?.bandApproved;

  if (!needsApproval) return null;

  return (
    <div className="w-full border-b border-punk-yellow/40 bg-punk-yellow/10 px-3 py-2.5 sm:px-6 lg:px-12">
      <p className="text-center font-body text-sm text-punk-white/90">
        Tu perfil está en proceso de verificación. Para agilizar el proceso, escribe a{" "}
        <a
          href="mailto:harremanak@nafarrock.com"
          className="font-semibold text-punk-yellow hover:underline"
        >
          harremanak@nafarrock.com
        </a>{" "}
        para que podamos comprobar y confirmar tu petición cuanto antes.
      </p>
    </div>
  );
}
