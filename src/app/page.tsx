import { HeroSection } from "@/components/home/HeroSection";
import { ExploreSection } from "@/components/home/ExploreSection";
import { ManifestoSection } from "@/components/home/ManifestoSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-punk-black">
      <HeroSection />
      <ExploreSection />
      <ManifestoSection />
    </main>
  );
}
