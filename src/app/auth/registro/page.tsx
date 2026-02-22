import { prisma } from "@/lib/prisma";
import { RegisterForm } from "./RegisterForm";

export const metadata = {
  title: "Registro",
  description: "Regístrate en Nafarrock como usuario, banda, sala, festival, promotor u organizador",
};

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

type EntityImageInfo = {
  hasImages: boolean;
  logoUrl?: string | null;
  imageUrl?: string | null;
  images: string[];
};

export default async function RegistroPage({ searchParams }: Props) {
  const params = await searchParams;
  const claimType = params.claim as "BAND" | "VENUE" | "FESTIVAL" | undefined;
  const claimId = params.claimId;
  const claimName = params.claimName;

  let entityImageInfo: EntityImageInfo | null = null;
  if (claimType && claimId) {
    if (claimType === "BAND") {
      const band = await prisma.band.findUnique({
        where: { id: claimId },
        select: { logoUrl: true, imageUrl: true, images: true },
      });
      if (band) {
        const hasImages = !!(band.logoUrl || band.imageUrl || ((band.images?.length ?? 0) > 0));
        entityImageInfo = { hasImages, logoUrl: band.logoUrl, imageUrl: band.imageUrl, images: band.images ?? [] };
      }
    } else if (claimType === "VENUE") {
      const venue = await prisma.venue.findUnique({
        where: { id: claimId },
        select: { logoUrl: true, imageUrl: true, images: true },
      });
      if (venue) {
        const hasImages = !!(venue.logoUrl || venue.imageUrl || ((venue.images?.length ?? 0) > 0));
        entityImageInfo = { hasImages, logoUrl: venue.logoUrl, imageUrl: venue.imageUrl, images: venue.images ?? [] };
      }
    } else if (claimType === "FESTIVAL") {
      const festival = await prisma.festival.findUnique({
        where: { id: claimId },
        select: { logoUrl: true, images: true },
      });
      if (festival) {
        const hasImages = !!(festival.logoUrl || ((festival.images?.length ?? 0) > 0));
        entityImageInfo = { hasImages, logoUrl: festival.logoUrl, images: festival.images ?? [] };
      }
    }
  }

  return (
    <RegisterForm
      claimType={claimType}
      claimId={claimId ?? undefined}
      claimName={claimName ?? undefined}
      entityImageInfo={entityImageInfo ?? undefined}
    />
  );
}
