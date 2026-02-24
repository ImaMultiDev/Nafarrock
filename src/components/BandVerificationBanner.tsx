"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export function BandVerificationBanner() {
  const { data: session } = useSession();

  if (session?.user?.role !== "BANDA" || session?.user?.bandApproved) {
    return null;
  }

  return (
    <div className="w-full border-b border-punk-yellow/40 bg-punk-yellow/10 px-3 py-2.5 sm:px-6 lg:px-12">
      <p className="text-center font-body text-sm text-punk-white/90">
        Tu banda está en proceso de verificación. Para agilizar el proceso, escribe a{" "}
        <a
          href="mailto:central@nafarrock.com"
          className="font-semibold text-punk-yellow hover:underline"
        >
          central@nafarrock.com
        </a>{" "}
        para que podamos comprobar y confirmar tu petición cuanto antes.
      </p>
    </div>
  );
}
