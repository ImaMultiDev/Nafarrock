import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { ESCENA_HIDDEN } from "./lib/feature-flags";

const escenaPaths = [
  "/escena",
  "/salas",
  "/promotores",
  "/organizadores",
  "/festivales",
  "/asociaciones",
  "/auth/acceso-escena",
];

function isEscenaPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(es|eu)(\/|$)/, "$2") || "/";
  return escenaPaths.some(
    (p) => withoutLocale === p || withoutLocale.startsWith(`${p}/`)
  );
}

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  if (ESCENA_HIDDEN && isEscenaPath(request.nextUrl.pathname)) {
    const locale = request.nextUrl.pathname.match(/^\/(es|eu)/)?.[1] ?? "es";
    const home = locale === "eu" ? "/eu" : "/";
    return NextResponse.redirect(new URL(home, request.url));
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*|admin(?:/.*)?|dashboard(?:/.*)?).*)",
  ],
};
