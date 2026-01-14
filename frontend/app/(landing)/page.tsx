import WhatsAppCta from "@/components/home/WhatsAppCta";
import Hero from "@/components/home/Hero";
import FAQ from "@/components/home/Faq";
import { getSEOTags } from "@/lib/seo";
import ModuleTcf from "@/components/home/Module";
import OnboardingGuide from "@/components/home/OnboardingGuide";
import Reviews from "@/components/home/Reviews";

export const metadata = getSEOTags({
  title: "Lumina TCF - Préparation TCF Canada avec Correction IA",
  description:
    "Préparez votre TCF Canada efficacement avec des examens blancs corrigés par IA, suivi de progression personnalisé et ressources complètes pour réussir.",
  canonicalUrlRelative: "/",
  keywords: [
    "TCF Canada",
    "préparation TCF",
    "examen français",
    "immigration Canada",
    "correction IA",
  ],
});

function HomePageDefault() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <OnboardingGuide />
      <WhatsAppCta />
      <div className="relative">
        <Hero />
      </div>
      <ModuleTcf />
      <Reviews />
      <FAQ />
    </div>
  );
}

export default HomePageDefault;
