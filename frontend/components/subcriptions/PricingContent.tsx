"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PricingCard from "@/components/subcriptions/PrincingCard";
import { usePlansList } from "@/hooks/queries/usePlansQueries";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";
import { PlanType } from "@/lib/api";

export default function PricingContent() {
  const { data: plans, isLoading, error, refetch } = usePlansList();

  if (isLoading) {
    return <LoadingSpinner className="py-8" text="Chargement des plans..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="Impossible de charger les plans"
        retry={() => refetch()}
      />
    );
  }

  // Filtrer les plans par type
  const b2cPlans =
    plans?.filter((p) => p.type === PlanType.B2C && p.is_active) ?? [];
  const b2bPlans =
    plans?.filter(
      (p) =>
        (p.type === PlanType.B2B_CENTER || p.type === PlanType.B2B_RESELLER) &&
        p.is_active
    ) ?? [];

  return (
    <div className="relative py-16 lg:py-24 overflow-hidden bg-linear-to-b from-emerald-50/5 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Grille de fond décorative */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-50 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Choisissez votre{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              formule
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Des plans adaptés à vos besoins, avec accès illimité aux examens
          </p>
        </div>

        {/* Moyens de paiement */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Paiement sécurisé via :
          </span>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <img
              src="/orange.jpg"
              alt="Orange Money"
              className="h-9 md:h-12 object-contain"
            />
            <img
              src="/momo.jpg"
              alt="MTN MoMo"
              className="h-9 md:h-12 object-contain"
            />
            <img
              src="/visa.png"
              alt="Visa"
              className="h-9 md:h-12 object-contain"
            />
            <img
              src="/master.png"
              alt="MasterCard"
              className="h-9 md:h-12 object-contain"
            />
            <img
              src="/paypal.png"
              alt="PayPal"
              className="h-9 md:h-12 object-contain"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="individual" className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-10 md:mb-12 bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="individual"
              className="rounded-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Étudiant
            </TabsTrigger>
            <TabsTrigger
              value="enterprise"
              className="rounded-md data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Entreprise / Centre
            </TabsTrigger>
          </TabsList>

          {/* Plans Étudiants (B2C) */}
          <TabsContent value="individual">
            {b2cPlans.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Aucun plan disponible pour le moment
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {b2cPlans.map((plan) => (
                  <PricingCard key={plan.id} plan={plan} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Plans Entreprises (B2B) */}
          <TabsContent value="enterprise">
            {b2bPlans.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-10 shadow-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    Offres Entreprises & Centres de formation
                  </h3>

                  <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg leading-relaxed">
                    Solutions sur mesure pour écoles, centres de formation,
                    entreprises et revendeurs avec gestion d'équipes,
                    statistiques avancées et tarifs préférentiels.
                  </p>

                  <a
                    href="mailto:contact@luminatcf.com?subject=Demande%20de%20devis%20entreprise"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg text-lg"
                  >
                    Demander un devis personnalisé
                    <svg
                      className="ml-3 w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                {b2bPlans.map((plan) => (
                  <PricingCard key={plan.id} plan={plan} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
