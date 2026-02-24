import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { uniqueSlug } from "@/lib/slug";
import { sendVerificationEmail } from "@/lib/email";
import { isValidEmail, isPasswordValid, isValidUrl } from "@/lib/validation";

const ROLES = ["USUARIO", "BANDA", "SALA", "FESTIVAL", "ASOCIACION", "ORGANIZADOR", "PROMOTOR"] as const;

const memberSchema = z.object({
  name: z.string().min(1),
  instrument: z.string().min(1),
});

const optionalUrl = z
  .string()
  .optional()
  .refine((v) => !v || v.trim() === "" || isValidUrl(v), "Introduce una URL válida (ej. https://...)");
const optionalUrlStrict = z
  .string()
  .optional()
  .refine((v) => !v || v.trim() === "" || /^https?:\/\/.+/i.test(v), "Introduce una URL válida");

const baseSchema = z.object({
  email: z
    .string()
    .refine(isValidEmail, "Introduce un email válido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .refine(isPasswordValid, "Contraseña: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellidos requeridos"),
  phone: z.string().optional(),
  role: z.enum(ROLES).default("USUARIO"),
});

const bandSchema = baseSchema.extend({
  role: z.literal("BANDA"),
  entityName: z.string().min(1, "Nombre de la banda requerido"),
  location: z.string().optional(),
  foundedYear: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
  bio: z.string().optional(),
  genres: z.array(z.string()).default([]),
  members: z.array(memberSchema).optional().default([]),
  spotifyUrl: optionalUrl,
  bandcampUrl: optionalUrl,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  webUrl: optionalUrl,
});

const venueSchema = baseSchema.extend({
  role: z.literal("SALA"),
  entityName: z.string().min(1, "Nombre de la sala requerido"),
  city: z.string().min(1, "Ciudad requerida"),
  address: z.string().optional(),
  description: z.string().optional(),
  foundedYear: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
  capacity: z.coerce.number().positive().optional(),
  websiteUrl: optionalUrlStrict,
  mapUrl: optionalUrlStrict,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
});

const festivalSchema = baseSchema.extend({
  role: z.literal("FESTIVAL"),
  entityName: z.string().min(1, "Nombre del festival requerido"),
  location: z.string().optional(),
  foundedYear: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
  description: z.string().optional(),
  websiteUrl: optionalUrlStrict,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
});

const asociacionSchema = baseSchema.extend({
  role: z.literal("ASOCIACION"),
  entityName: z.string().min(1, "Nombre de la asociación requerido"),
  location: z.string().optional(),
  foundedYear: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
  description: z.string().optional(),
  websiteUrl: optionalUrlStrict,
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
});

const organizerSchema = baseSchema.extend({
  role: z.literal("ORGANIZADOR"),
  entityName: z.string().min(1, "Nombre del organizador requerido"),
  description: z.string().optional(),
  websiteUrl: optionalUrlStrict,
});

const promoterSchema = baseSchema.extend({
  role: z.literal("PROMOTOR"),
  entityName: z.string().min(1, "Nombre del promotor requerido"),
  description: z.string().optional(),
  websiteUrl: optionalUrlStrict,
});

const userOnlySchema = baseSchema.extend({
  role: z.literal("USUARIO"),
});

function cleanUrl(url: string | undefined): string | undefined {
  if (!url || url.trim() === "") return undefined;
  return url;
}

async function createAndSendVerificationToken(
  email: string,
  name?: string | null
): Promise<{ skipVerification: boolean }> {
  if (!process.env.RESEND_API_KEY) {
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
    return { skipVerification: true };
  }
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });
  await sendVerificationEmail(email, token, name ?? undefined);
  return { skipVerification: false };
}

const claimSchema = baseSchema.extend({
  role: z.enum(["BANDA", "SALA", "FESTIVAL", "ASOCIACION"]),
  claimType: z.enum(["BAND", "VENUE", "FESTIVAL", "ASOCIACION"]),
  claimId: z.string().min(1),
  claimName: z.string().min(1),
  claimLogoUrl: z.string().url().optional().or(z.literal("")),
  claimImageUrl: z.string().url().optional().or(z.literal("")),
  claimImages: z.array(z.string().url()).optional().default([]),
  imageChoice: z.enum(["keep_nafarrock", "use_mine"]).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const role = body.role ?? "USUARIO";

    // Modo reclamación: registrarse para reclamar un perfil existente
    if (body.claimType && body.claimId && body.claimName) {
      const parsed = claimSchema.safeParse(body);
      if (!parsed.success) {
        const first = parsed.error.errors[0];
        return NextResponse.json(
          { message: first?.message ?? "Datos inválidos", errors: parsed.error.flatten() },
          { status: 400 }
        );
      }
      const data = parsed.data;

      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        return NextResponse.json(
          { message: "Ya existe una cuenta con este email" },
          { status: 409 }
        );
      }

      const claimEntityType = data.claimType as "BAND" | "VENUE" | "FESTIVAL" | "ASOCIACION";
      if (claimEntityType === "BAND") {
        const band = await prisma.band.findUnique({ where: { id: data.claimId } });
        if (!band) return NextResponse.json({ message: "Banda no encontrada" }, { status: 404 });
        if (band.userId)
          return NextResponse.json({ message: "Este perfil ya tiene propietario" }, { status: 400 });
        const pendingClaim = await prisma.profileClaim.findFirst({
          where: { bandId: data.claimId, status: "PENDING_CLAIM" },
        });
        if (pendingClaim)
          return NextResponse.json(
            { message: "Ya existe una solicitud pendiente para este perfil" },
            { status: 400 }
          );
      } else if (claimEntityType === "VENUE") {
        const venue = await prisma.venue.findUnique({ where: { id: data.claimId } });
        if (!venue) return NextResponse.json({ message: "Sala no encontrada" }, { status: 404 });
        if (venue.userId)
          return NextResponse.json({ message: "Este perfil ya tiene propietario" }, { status: 400 });
        const pendingClaim = await prisma.profileClaim.findFirst({
          where: { venueId: data.claimId, status: "PENDING_CLAIM" },
        });
        if (pendingClaim)
          return NextResponse.json(
            { message: "Ya existe una solicitud pendiente para este perfil" },
            { status: 400 }
          );
      } else if (claimEntityType === "FESTIVAL") {
        const festival = await prisma.festival.findUnique({ where: { id: data.claimId } });
        if (!festival) return NextResponse.json({ message: "Festival no encontrado" }, { status: 404 });
        if (festival.userId)
          return NextResponse.json({ message: "Este perfil ya tiene propietario" }, { status: 400 });
        const pendingClaim = await prisma.profileClaim.findFirst({
          where: { festivalId: data.claimId, status: "PENDING_CLAIM" },
        });
        if (pendingClaim)
          return NextResponse.json(
            { message: "Ya existe una solicitud pendiente para este perfil" },
            { status: 400 }
          );
      } else if (claimEntityType === "ASOCIACION") {
        const asoc = await prisma.asociacion.findUnique({ where: { id: data.claimId } });
        if (!asoc) return NextResponse.json({ message: "Asociación no encontrada" }, { status: 404 });
        if (asoc.userId)
          return NextResponse.json({ message: "Este perfil ya tiene propietario" }, { status: 400 });
        const pendingClaim = await prisma.profileClaim.findFirst({
          where: { associationId: data.claimId, status: "PENDING_CLAIM" },
        });
        if (pendingClaim)
          return NextResponse.json(
            { message: "Ya existe una solicitud pendiente para este perfil" },
            { status: 400 }
          );
      }

      const hashedPassword = await hash(data.password, 12);
      const name = `${data.firstName} ${data.lastName}`.trim();

      const userRole = claimEntityType === "BAND" ? "BANDA" : claimEntityType === "VENUE" ? "SALA" : claimEntityType === "ASOCIACION" ? "ASOCIACION" : "FESTIVAL";
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          role: userRole,
        },
      });

      const userHasImages = !!(data.claimLogoUrl || data.claimImageUrl || ((data.claimImages?.length ?? 0) > 0));
      const imageChoiceValue =
        data.imageChoice ?? (userHasImages ? "use_mine" : "keep_nafarrock");

      await prisma.profileClaim.create({
        data: {
          userId: user.id,
          entityType: claimEntityType,
          entityId: data.claimId,
          status: "PENDING_CLAIM",
          claimLogoUrl: data.claimLogoUrl || null,
          claimImageUrl: data.claimImageUrl || null,
          claimImages: data.claimImages ?? [],
          imageChoice: imageChoiceValue,
          ...(claimEntityType === "BAND" && { bandId: data.claimId }),
          ...(claimEntityType === "VENUE" && { venueId: data.claimId }),
          ...(claimEntityType === "FESTIVAL" && { festivalId: data.claimId }),
          ...(claimEntityType === "ASOCIACION" && { associationId: data.claimId }),
        },
      });

      const { skipVerification } = await createAndSendVerificationToken(data.email, name);
      return NextResponse.json({
        success: true,
        requiresVerification: !skipVerification,
        email: data.email,
      });
    }

    let parsed: z.SafeParseReturnType<unknown, unknown>;
    switch (role) {
      case "BANDA":
        parsed = bandSchema.safeParse(body);
        break;
      case "SALA":
        parsed = venueSchema.safeParse(body);
        break;
      case "FESTIVAL":
        parsed = festivalSchema.safeParse(body);
        break;
      case "ASOCIACION":
        parsed = asociacionSchema.safeParse(body);
        break;
      case "ORGANIZADOR":
        parsed = organizerSchema.safeParse(body);
        break;
      case "PROMOTOR":
        parsed = promoterSchema.safeParse(body);
        break;
      default:
        parsed = userOnlySchema.safeParse(body);
    }

    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { message: first?.message ?? "Datos inválidos", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data as z.infer<typeof baseSchema> & Record<string, unknown>;

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json(
        { message: "Ya existe una cuenta con este email" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(data.password, 12);
    const name = `${data.firstName} ${data.lastName}`.trim();

    if (data.role === "USUARIO") {
      await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || null,
          role: "USUARIO",
        },
      });
      const { skipVerification } = await createAndSendVerificationToken(
        data.email,
        name
      );
      return NextResponse.json({
        success: true,
        requiresVerification: !skipVerification,
        email: data.email,
      });
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        role: data.role,
      },
    });

    const entityName = (data as { entityName?: string }).entityName ?? "";

    if (data.role === "BANDA") {
      const d = data as z.infer<typeof bandSchema>;
      const slug = await uniqueSlug(
        (s) => prisma.band.findUnique({ where: { slug: s } }).then(Boolean),
        entityName
      );
      await prisma.band.create({
        data: {
          slug,
          name: entityName,
          bio: d.bio || null,
          genres: d.genres ?? [],
          location: d.location || null,
          foundedYear: d.foundedYear || null,
          spotifyUrl: cleanUrl(d.spotifyUrl),
          bandcampUrl: cleanUrl(d.bandcampUrl),
          instagramUrl: cleanUrl(d.instagramUrl),
          facebookUrl: cleanUrl(d.facebookUrl),
          youtubeUrl: cleanUrl(d.youtubeUrl),
          webUrl: cleanUrl(d.webUrl),
          approved: false,
          userId: user.id,
          members: {
            create: (d.members ?? []).map((m, i) => ({
              name: m.name,
              instrument: m.instrument,
              order: i,
            })),
          },
        },
      });
    } else if (data.role === "SALA") {
      const d = data as z.infer<typeof venueSchema>;
      const slug = await uniqueSlug(
        (s) => prisma.venue.findUnique({ where: { slug: s } }).then(Boolean),
        entityName
      );
      await prisma.venue.create({
        data: {
          slug,
          name: entityName,
          city: d.city,
          address: d.address || null,
          description: d.description || null,
          foundedYear: d.foundedYear || null,
          capacity: d.capacity || null,
          websiteUrl: cleanUrl(d.websiteUrl),
          mapUrl: cleanUrl(d.mapUrl),
          instagramUrl: cleanUrl(d.instagramUrl),
          facebookUrl: cleanUrl(d.facebookUrl),
          approved: false,
          userId: user.id,
        },
      });
    } else if (data.role === "FESTIVAL") {
      const d = data as z.infer<typeof festivalSchema>;
      const slug = await uniqueSlug(
        (s) => prisma.festival.findUnique({ where: { slug: s } }).then(Boolean),
        entityName
      );
      await prisma.festival.create({
        data: {
          slug,
          name: entityName,
          description: d.description || null,
          location: d.location || null,
          foundedYear: d.foundedYear || null,
          websiteUrl: cleanUrl(d.websiteUrl),
          instagramUrl: cleanUrl(d.instagramUrl),
          facebookUrl: cleanUrl(d.facebookUrl),
          approved: false,
          userId: user.id,
        },
      });
    } else if (data.role === "ASOCIACION") {
      const d = data as z.infer<typeof asociacionSchema>;
      const slug = await uniqueSlug(
        (s) => prisma.asociacion.findUnique({ where: { slug: s } }).then(Boolean),
        entityName
      );
      await prisma.asociacion.create({
        data: {
          slug,
          name: entityName,
          description: d.description || null,
          location: d.location || null,
          foundedYear: d.foundedYear || null,
          websiteUrl: cleanUrl(d.websiteUrl),
          instagramUrl: cleanUrl(d.instagramUrl),
          facebookUrl: cleanUrl(d.facebookUrl),
          approved: false,
          userId: user.id,
        },
      });
    } else if (data.role === "ORGANIZADOR") {
      const d = data as z.infer<typeof organizerSchema>;
      const slug = await uniqueSlug(
        (s) => prisma.organizer.findUnique({ where: { slug: s } }).then(Boolean),
        entityName
      );
      await prisma.organizer.create({
        data: {
          slug,
          name: entityName,
          description: d.description || null,
          websiteUrl: cleanUrl(d.websiteUrl),
          approved: false,
          userId: user.id,
        },
      });
    } else if (data.role === "PROMOTOR") {
      const d = data as z.infer<typeof promoterSchema>;
      const slug = await uniqueSlug(
        (s) => prisma.promoter.findUnique({ where: { slug: s } }).then(Boolean),
        entityName
      );
      await prisma.promoter.create({
        data: {
          slug,
          name: entityName,
          description: d.description || null,
          websiteUrl: cleanUrl(d.websiteUrl),
          approved: false,
          userId: user.id,
        },
      });
    }

    const { skipVerification } = await createAndSendVerificationToken(
      data.email,
      name
    );
    return NextResponse.json({
      success: true,
      requiresVerification: !skipVerification,
      email: data.email,
    });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
