import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { Header } from "@/components/ui/Header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "Nafarrock | Guía del rock en Navarra",
    template: "%s | Nafarrock",
  },
  description:
    "La guía y plataforma de referencia del punk rock, rock urbano y escena alternativa navarra. Bandas, festivales, conciertos y salas.",
  keywords: ["rock", "punk", "Navarra", "conciertos", "bandas", "festivales"],
  openGraph: {
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${orbitron.variable}`}>
      <body className="font-body min-h-screen">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
