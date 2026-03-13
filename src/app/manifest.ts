import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl();

  return {
    name: "Nafarrock",
    short_name: "Nafarrock",
    description: "Escena rock en Nafarroa. Conciertos, bandas, salas, festivales y tablón de anuncios.",
    start_url: "/",
    id: `${siteUrl}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#E60026",
    related_applications: [
      {
        platform: "webapp",
        url: "/manifest.webmanifest",
        id: `${siteUrl}/`,
      },
    ],
    icons: [
      {
        src: "/logo-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
