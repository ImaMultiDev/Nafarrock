/**
 * Seed inicial para Nafarrock
 * Datos de ejemplo: bandas, salas, eventos
 *
 * IMPORTANTE: ADMIN_EMAIL y ADMIN_PASSWORD son OBLIGATORIOS.
 * Define estas variables en .env (local) o en Vercel (producción).
 * Nunca incluyas credenciales reales en el código.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(
      `Variable de entorno ${name} es obligatoria. Define ${name} en .env o en Vercel.`,
    );
  }
  return value.trim();
}

async function main() {
  const adminEmail = requireEnv("ADMIN_EMAIL");
  const adminPasswordPlain = requireEnv("ADMIN_PASSWORD");
  const adminPassword = await hash(adminPasswordPlain, 12);

  console.log("Creando/actualizando admin:", adminEmail);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      password: adminPassword,
      emailVerified: new Date(),
    },
    create: {
      email: adminEmail,
      password: adminPassword,
      name: "Admin Nafarrock",
      firstName: "Admin",
      lastName: "Nafarrock",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const venue1 = await prisma.venue.upsert({
    where: { slug: "sala-zentral" },
    update: {},
    create: {
      slug: "sala-zentral",
      name: "Sala Zentral",
      city: "Pamplona",
      address: "Calle ejemplo 1",
      capacity: 400,
      isActive: true,
    },
  });

  let band1 = await prisma.band.findUnique({
    where: { slug: "banda-ejemplo" },
  });
  const seedBandaEmail = process.env.SEED_BANDA_EMAIL;
  const seedBandaPassword = process.env.SEED_BANDA_PASSWORD;
  if (!band1 && seedBandaEmail && seedBandaPassword) {
    const userBanda = await prisma.user.create({
      data: {
        email: seedBandaEmail,
        password: await hash(seedBandaPassword, 12),
        name: "Banda Ejemplo",
        role: "BANDA",
        emailVerified: new Date(),
      },
    });
    band1 = await prisma.band.create({
      data: {
        slug: "banda-ejemplo",
        name: "Banda Ejemplo",
        bio: "Rock nafarroar desde siempre.",
        genres: ["punk", "rock urbano"],
        location: "Pamplona",
        isActive: true,
        isEmerging: true,
        approved: true,
        approvedAt: new Date(),
        userId: userBanda.id,
      },
    });
  }

  const existingEvent = await prisma.event.findUnique({
    where: { slug: "concierto-ejemplo-2025" },
  });
  if (!existingEvent && band1) {
    await prisma.event.create({
      data: {
        slug: "concierto-ejemplo-2025",
        title: "Concierto Ejemplo 2025",
        type: "CONCIERTO",
        date: new Date("2025-06-15T21:00:00"),
        doorsOpen: "20:00",
        venueId: venue1.id,
        price: "10€",
        isApproved: true,
        approvedAt: new Date(),
        bands: {
          create: [{ bandId: band1.id, order: 0, isHeadliner: true }],
        },
      },
    });
  }

  console.log("Seed completado:", { admin: admin.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
