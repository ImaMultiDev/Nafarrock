import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { uniqueSlug } from "@/lib/slug";

const ROLES = ["USUARIO", "BANDA", "SALA", "FESTIVAL", "ORGANIZADOR", "PROMOTOR"] as const;

const memberSchema = z.object({
  name: z.string().min(1),
  instrument: z.string().min(1),
});

const baseSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Mínimo 6 caracteres"),
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
  spotifyUrl: z.string().url().optional().or(z.literal("")),
  bandcampUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  youtubeUrl: z.string().url().optional().or(z.literal("")),
  webUrl: z.string().url().optional().or(z.literal("")),
});

const venueSchema = baseSchema.extend({
  role: z.literal("SALA"),
  entityName: z.string().min(1, "Nombre de la sala requerido"),
  city: z.string().min(1, "Ciudad requerida"),
  address: z.string().optional(),
  description: z.string().optional(),
  foundedYear: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
  capacity: z.coerce.number().positive().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  mapUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
});

const festivalSchema = baseSchema.extend({
  role: z.literal("FESTIVAL"),
  entityName: z.string().min(1, "Nombre del festival requerido"),
  location: z.string().optional(),
  foundedYear: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
});

const organizerSchema = baseSchema.extend({
  role: z.literal("ORGANIZADOR"),
  entityName: z.string().min(1, "Nombre del organizador requerido"),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

const promoterSchema = baseSchema.extend({
  role: z.literal("PROMOTOR"),
  entityName: z.string().min(1, "Nombre del promotor requerido"),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

const userOnlySchema = baseSchema.extend({
  role: z.literal("USUARIO"),
});

function cleanUrl(url: string | undefined): string | undefined {
  if (!url || url.trim() === "") return undefined;
  return url;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const role = body.role ?? "USUARIO";

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
      return NextResponse.json({ success: true });
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

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
