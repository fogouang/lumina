// app/pricing/page.tsx
import { Suspense } from "react";
import { getSEOTags, renderSchemaTags } from "@/lib/seo";
import { PlansService } from "@/lib/api";
import PricingContent from "@/components/subcriptions/PricingContent";

// Metadata SEO (fonctionne seulement en Server Component)
export const metadata = getSEOTags({
  title: "Tarifs - Lumina TCF | Abonnements Préparation TCF Canada",
  description:
    "Choisissez votre formule d'abonnement pour préparer le TCF Canada : accès illimité aux examens, correction IA instantanée et suivi personnalisé.",
  canonicalUrlRelative: "/pricing",
  keywords: [
    "prix TCF Canada",
    "abonnement préparation TCF",
    "tarif examen français",
  ],
});

// Fonction pour récupérer les plans côté serveur
async function getPlans() {
  try {
    const response = await PlansService.getPlansApiV1PlansGet(
      undefined, // skip
      100, // limit
      undefined, // planType
      true // activeOnly
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
}

export default async function PricingPage() {
  // Fetch les plans côté serveur
  const plans = await getPlans();

  return (
    <>
      {/* Schema JSON-LD avec les vrais prix */}
      {renderSchemaTags(plans)}

      {/* Le reste du contenu (client component) */}
      <Suspense fallback={<div>Chargement...</div>}>
        <PricingContent />
      </Suspense>
    </>
  );
}
