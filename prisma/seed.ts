/**
 * Seed inicial para Nafarrock
 * Datos de ejemplo: bandas, salas, eventos
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nafarrock.local" },
    update: {},
    create: {
      email: "admin@nafarrock.local",
      password: adminPassword,
      name: "Admin Nafarrock",
      role: "ADMIN",
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

  let band1 = await prisma.band.findUnique({ where: { slug: "banda-ejemplo" } });
  if (!band1) {
    const userBanda = await prisma.user.create({
      data: {
        email: "banda@nafarrock.local",
        password: await hash("banda123", 12),
        name: "Banda Ejemplo",
        role: "BANDA",
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
  if (!existingEvent) {
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
          create: [{ bandId: band1!.id, order: 0, isHeadliner: true }],
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
