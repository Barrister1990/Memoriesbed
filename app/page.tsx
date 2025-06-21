import { AboutSection } from '@/components/ui/about-section';
import { ContactSection } from '@/components/ui/contact-section';
import { HeroSection } from '@/components/ui/hero-section';

export default function Home() {
  return (
    <div className="min-h-screen">
  
      <HeroSection />
      <AboutSection />
      <ContactSection />
    </div>
  );
}