import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            password: true,
            emailVerified: true,
            scheduledDeletionAt: true,
          },
        });
        if (!user?.password) return null;
        const valid = await compare(credentials.password, user.password);
        if (!valid) return null;
        if (!user.emailVerified && user.role !== "ADMIN") {
          throw new Error("EmailNotVerified");
        }
        if (user.scheduledDeletionAt) {
          if (user.scheduledDeletionAt < new Date()) {
            await prisma.user.delete({ where: { id: user.id } });
            throw new Error("AccountDeleted");
          }
          throw new Error(`PendingDeletion|${user.scheduledDeletionAt.toISOString()}`);
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
];

// Google OAuth: solo si las variables de entorno están configuradas
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 días
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // OAuth (Google): marcar email como verificado automáticamente
      if (account?.provider === "google" && user?.email) {
        await prisma.user.updateMany({
          where: { email: user.email },
          data: { emailVerified: new Date() },
        });
        // Comprobar cuenta programada para borrado
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { scheduledDeletionAt: true },
        });
        if (dbUser?.scheduledDeletionAt) {
          if (dbUser.scheduledDeletionAt < new Date()) {
            await prisma.user.delete({ where: { email: user.email } });
            return "/auth/login?deleted=done";
          }
          return `/auth/login?deleted=pending&date=${encodeURIComponent(dbUser.scheduledDeletionAt.toISOString())}`;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      const rolesWithApproval = ["BANDA", "SALA", "FESTIVAL", "ASOCIACION", "PROMOTOR", "ORGANIZADOR"] as const;
      const needsApproval = token.id && token.role && rolesWithApproval.includes(token.role as (typeof rolesWithApproval)[number]);
      if (needsApproval) {
        let approved = false;
        const uid = token.id as string;
        if (token.role === "BANDA") {
          const band = await prisma.band.findUnique({ where: { userId: uid }, select: { approved: true } });
          approved = band?.approved ?? false;
        } else if (token.role === "SALA") {
          const venue = await prisma.venue.findUnique({ where: { userId: uid }, select: { approved: true } });
          approved = venue?.approved ?? false;
        } else if (token.role === "FESTIVAL") {
          const festival = await prisma.festival.findUnique({ where: { userId: uid }, select: { approved: true } });
          approved = festival?.approved ?? false;
        } else if (token.role === "ASOCIACION") {
          const asoc = await prisma.asociacion.findUnique({ where: { userId: uid }, select: { approved: true } });
          approved = asoc?.approved ?? false;
        } else if (token.role === "PROMOTOR") {
          const promoter = await prisma.promoter.findUnique({ where: { userId: uid }, select: { approved: true } });
          approved = promoter?.approved ?? false;
        } else if (token.role === "ORGANIZADOR") {
          const organizer = await prisma.organizer.findUnique({ where: { userId: uid }, select: { approved: true } });
          approved = organizer?.approved ?? false;
        }
        token.profileApproved = approved;
        token.effectiveRole = approved ? (token.role as string) : "USUARIO";
      } else if (token.role) {
        token.effectiveRole = token.role as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.effectiveRole = (token.effectiveRole as string) ?? token.role;
        const rolesWithApproval = ["BANDA", "SALA", "FESTIVAL", "ASOCIACION", "PROMOTOR", "ORGANIZADOR"] as const;
        if (token.id && token.role && rolesWithApproval.includes(token.role as (typeof rolesWithApproval)[number])) {
          session.user.bandApproved = token.profileApproved;
          session.user.profileApproved = token.profileApproved;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
