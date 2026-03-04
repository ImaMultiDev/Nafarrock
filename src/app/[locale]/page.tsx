import { HeroSection } from "@/components/home/HeroSection";
import { GlobalSearchSection } from "@/components/home/GlobalSearchSection";
import { ExploreSection } from "@/components/home/ExploreSection";
import { ManifestoSection } from "@/components/home/ManifestoSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-punk-black">
      <HeroSection />
      <GlobalSearchSection />
      <ExploreSection />
      <ManifestoSection />
    </main>
  );
}
