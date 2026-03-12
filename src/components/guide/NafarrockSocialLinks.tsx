"use client";

import { useLocale } from "next-intl";
import { SocialLinks, type SocialLinkItem } from "@/components/ui/SocialLinks";

export function NafarrockSocialLinks() {
  const locale = useLocale();
  const contactPath = locale === "eu" ? "/eu/contacto" : "/contacto";

  const links: SocialLinkItem[] = [
    { kind: "instagram", url: "https://instagram.com/nafarrock", label: "Instagram" },
    { kind: "facebook", url: "https://facebook.com/nafarrock", label: "Facebook" },
    { kind: "email", url: contactPath, label: "Contacto (harremanak@nafarrock.com)" },
  ];

  return (
    <div className="mt-4 flex flex-wrap items-center gap-4">
      <SocialLinks links={links} variant="green" iconOnly showLabels={false} />
    </div>
  );
}
