import type { Metadata } from "next";
import { Inter, Bebas_Neue, Space_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { Providers } from "@/components/providers/Providers";
import { Header } from "@/components/ui/Header";
import { BandVerificationBanner } from "@/components/BandVerificationBanner";
import { FooterSection } from "@/components/home/FooterSection";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-punch",
});

export const metadata: Metadata = {
  title: {
    default: "Nafarrock | Guía del rock en Nafarroa",
    template: "%s | Nafarrock",
  },
  description:
    "La guía y plataforma de referencia del punk rock, rock urbano y escena alternativa nafarroa. Bandas, festivales, conciertos y salas.",
  keywords: ["rock", "punk", "Nafarroa", "conciertos", "bandas", "festivales"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/logo-192.png",
  },
  openGraph: {
    type: "website",
    images: ["/LogoRedes.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${bebas.variable} ${spaceMono.variable}`}>
      <body className="font-body min-h-screen overflow-x-hidden bg-punk-black">
        <NextTopLoader color="#E60026" height={3} showSpinner={false} />
        <div className="noise-overlay" aria-hidden />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Header />
            <BandVerificationBanner />
            {children}
            <FooterSection />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
