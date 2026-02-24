"use client";

import { Globe, MapPin, Mail } from "lucide-react";

export type SocialLinkKind =
  | "instagram"
  | "spotify"
  | "facebook"
  | "youtube"
  | "bandcamp"
  | "web"
  | "twitter"
  | "map"
  | "email";

export type SocialLinkItem = {
  kind: SocialLinkKind;
  url: string;
  label?: string;
};

const iconSize = 20;

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={iconSize} height={iconSize}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={iconSize} height={iconSize}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.24 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={iconSize} height={iconSize}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={iconSize} height={iconSize}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function BandcampIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={iconSize} height={iconSize}>
      <path d="M0 18.75l7.437-13.5h24L17.625 18.75H0z" />
    </svg>
  );
}

function WebIcon({ className }: { className?: string }) {
  return <Globe className={className} size={iconSize} strokeWidth={2} />;
}

function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} width={iconSize} height={iconSize}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function MapIcon({ className }: { className?: string }) {
  return <MapPin className={className} size={iconSize} strokeWidth={2} />;
}

function EmailIcon({ className }: { className?: string }) {
  return <Mail className={className} size={iconSize} strokeWidth={2} />;
}

type SocialLinksProps = {
  links: SocialLinkItem[];
  variant?: "green" | "pink" | "red" | "yellow";
  /** Mostrar texto junto al icono (por defecto true para mejor UX) */
  showLabels?: boolean;
  className?: string;
};

const variantStyles = {
  green: "border-punk-green text-punk-green hover:bg-punk-green hover:text-punk-black",
  pink: "border-punk-pink text-punk-pink hover:bg-punk-pink hover:text-punk-black",
  red: "border-punk-red text-punk-red hover:bg-punk-red hover:text-punk-black",
  yellow: "border-punk-yellow text-punk-yellow hover:bg-punk-yellow hover:text-punk-black",
};

const kindLabels: Record<SocialLinkKind, string> = {
  instagram: "Instagram",
  spotify: "Spotify",
  facebook: "Facebook",
  youtube: "YouTube",
  bandcamp: "Bandcamp",
  web: "Web",
  twitter: "X",
  map: "Mapa",
  email: "Contacto",
};

export function SocialLinks({ links, variant = "green", showLabels = true, className = "" }: SocialLinksProps) {
  if (links.length === 0) return null;

  const style = variantStyles[variant];

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`} role="group" aria-label="Redes y enlaces">
      {links.map(({ kind, url, label }) => {
        const isExternal = !url.startsWith("mailto:");
        const ariaLabel = label ?? kindLabels[kind];
        return (
          <a
            key={`${kind}-${url}`}
            href={url}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className={`inline-flex items-center justify-center gap-2 rounded border-2 px-4 py-2.5 transition-all hover:scale-105 ${style}`}
            aria-label={ariaLabel}
            title={ariaLabel}
          >
            {kind === "instagram" && <InstagramIcon />}
            {kind === "spotify" && <SpotifyIcon />}
            {kind === "facebook" && <FacebookIcon />}
            {kind === "youtube" && <YoutubeIcon />}
            {kind === "bandcamp" && <BandcampIcon />}
            {kind === "web" && <WebIcon />}
            {kind === "twitter" && <TwitterXIcon />}
            {kind === "map" && <MapIcon />}
            {kind === "email" && <EmailIcon />}
            {showLabels && (
              <span className="font-punch text-xs uppercase tracking-widest">{ariaLabel}</span>
            )}
          </a>
        );
      })}
    </div>
  );
}
