import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/login?error=VerificationTokenMissing", req.url)
    );
  }

  const verification = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verification) {
    return NextResponse.redirect(
      new URL("/auth/login?error=VerificationTokenInvalid", req.url)
    );
  }

  if (verification.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.redirect(
      new URL("/auth/login?error=VerificationTokenExpired", req.url)
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: verification.identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return NextResponse.redirect(
    new URL("/auth/login?verified=1", req.url)
  );
}
