import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isBolos = req.nextUrl.pathname === "/bolos" || req.nextUrl.pathname.startsWith("/bolos/");

  if (isBolos) {
    if (!token) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    if (token.role !== "BANDA") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (isAdmin || isDashboard) {
    if (!token) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    if (isAdmin && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/bolos", "/bolos/:path*"],
};
