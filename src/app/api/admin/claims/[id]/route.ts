import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sendClaimApprovedEmail, sendClaimRejectedEmail } from "@/lib/email";
import { z } from "zod";

const bodySchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Acción inválida" }, { status: 400 });
    }
    const { action } = parsed.data;

    const claim = await prisma.profileClaim.findUnique({
      where: { id },
      include: { user: true, band: true, venue: true, festival: true },
    });
    if (!claim) return NextResponse.json({ message: "Solicitud no encontrada" }, { status: 404 });
    if (claim.status !== "PENDING_CLAIM") {
      return NextResponse.json({ message: "La solicitud ya fue procesada" }, { status: 400 });
    }

    if (action === "reject") {
      const entityName = claim.band?.name ?? claim.venue?.name ?? claim.festival?.name ?? "perfil";
      const entityType = claim.entityType;

      await prisma.profileClaim.update({
        where: { id },
        data: {
          status: "REJECTED",
          processedAt: new Date(),
          processedBy: session.user.id,
        },
      });

      await sendClaimRejectedEmail(claim.user.email, entityName, entityType);

      return NextResponse.json({ success: true });
    }

    // Aplicar imágenes según elección del reclamante
    const useClaimImages = claim.imageChoice === "use_mine" && (claim.claimLogoUrl || claim.claimImageUrl || (claim.claimImages?.length ?? 0) > 0);
    const imageUpdate =
      useClaimImages
        ? {
            ...(claim.claimLogoUrl && { logoUrl: claim.claimLogoUrl }),
            ...(claim.claimImageUrl && { imageUrl: claim.claimImageUrl }),
            ...(claim.claimImages && claim.claimImages.length > 0 && { images: claim.claimImages }),
          }
        : {};

    // Approve: asociar perfil al usuario
    if (claim.bandId) {
      const band = claim.band!;
      if (band.userId) {
        return NextResponse.json({ message: "La banda ya tiene propietario" }, { status: 400 });
      }
      await prisma.$transaction([
        prisma.band.update({
          where: { id: band.id },
          data: {
            userId: claim.userId,
            createdByNafarrock: false,
            approved: true,
            approvedAt: new Date(),
            approvedBy: session.user.id,
            ...imageUpdate,
          },
        }),
        prisma.user.update({
          where: { id: claim.userId },
          data: { role: "BANDA" },
        }),
        prisma.profileClaim.update({
          where: { id },
          data: {
            status: "APPROVED",
            processedAt: new Date(),
            processedBy: session.user.id,
          },
        }),
      ]);

      await sendClaimApprovedEmail(claim.user.email, band.name, "BAND");
    } else if (claim.venueId) {
      const venue = claim.venue!;
      if (venue.userId) {
        return NextResponse.json({ message: "La sala ya tiene propietario" }, { status: 400 });
      }
      await prisma.$transaction([
        prisma.venue.update({
          where: { id: venue.id },
          data: {
            userId: claim.userId,
            createdByNafarrock: false,
            approved: true,
            approvedAt: new Date(),
            approvedBy: session.user.id,
            ...imageUpdate,
          },
        }),
        prisma.user.update({
          where: { id: claim.userId },
          data: { role: "SALA" },
        }),
        prisma.event.updateMany({
          where: { venueId: venue.id, createdByUserId: null },
          data: { createdByUserId: claim.userId, createdByNafarrock: false },
        }),
        prisma.profileClaim.update({
          where: { id },
          data: {
            status: "APPROVED",
            processedAt: new Date(),
            processedBy: session.user.id,
          },
        }),
      ]);

      await sendClaimApprovedEmail(claim.user.email, venue.name, "VENUE");
    } else if (claim.festivalId) {
      const festival = claim.festival!;
      if (festival.userId) {
        return NextResponse.json({ message: "El festival ya tiene propietario" }, { status: 400 });
      }
      await prisma.$transaction([
        prisma.festival.update({
          where: { id: festival.id },
          data: {
            userId: claim.userId,
            createdByNafarrock: false,
            approved: true,
            approvedAt: new Date(),
            approvedBy: session.user.id,
            ...(useClaimImages && claim.claimLogoUrl && { logoUrl: claim.claimLogoUrl }),
            ...(useClaimImages && claim.claimImages && claim.claimImages.length > 0 && { images: claim.claimImages }),
          },
        }),
        prisma.user.update({
          where: { id: claim.userId },
          data: { role: "FESTIVAL" },
        }),
        prisma.event.updateMany({
          where: { festivalId: festival.id, createdByUserId: null },
          data: { createdByUserId: claim.userId, createdByNafarrock: false },
        }),
        prisma.profileClaim.update({
          where: { id },
          data: {
            status: "APPROVED",
            processedAt: new Date(),
            processedBy: session.user.id,
          },
        }),
      ]);

      await sendClaimApprovedEmail(claim.user.email, festival.name, "FESTIVAL");
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    console.error("[admin claims PATCH]", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
