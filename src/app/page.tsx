import { HeroSection } from '@/components/landing/HeroSection';
import { EventCategoriesSection } from '@/components/landing/EventCategoriesSection';
import { FeatureHighlights } from '@/components/landing/FeatureHighlights';
import { ArchitectureBanner } from '@/components/landing/ArchitectureBanner';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <EventCategoriesSection />
      <FeatureHighlights />
      <ArchitectureBanner />
    </div>
  );
}
