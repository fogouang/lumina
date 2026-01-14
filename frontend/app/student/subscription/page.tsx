"use client";

import { useState } from "react";
import { CreditCard, Zap, Plus, History } from "lucide-react";
import { useMySubscriptions } from "@/hooks/queries/useSubscriptionsQueries";
import { usePlansList } from "@/hooks/queries/usePlansQueries";
import PageHeader from "@/components/shared/PageHeader";
import SubscriptionCard from "@/components/student/SubscriptionCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanType } from "@/lib/api";

import PricingCard from "@/components/subcriptions/PrincingCard";
import { ROUTES } from "@/lib/constants";
import router from "next/router";

export default function SubscriptionPage() {
  const [showPlansDialog, setShowPlansDialog] = useState(false);

  const { data: subscriptions, isLoading: subsLoading } = useMySubscriptions();
  const { data: plans, isLoading: plansLoading } = usePlansList(
    undefined,
    100,
    PlanType.B2C,
    true
  );

  const activeSubscription = subscriptions?.find((s) => s.is_active);
  const activePlan = plans?.find((p) => p.id === activeSubscription?.plan_id);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Mon Abonnement"
          description="Gérer votre souscription et vos crédits IA"
        />

        {/* Abonnement actif */}
        {activeSubscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Abonnement actif</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(ROUTES.STUDENT_INVOICES)} 
              >
                <History className="mr-2 h-4 w-4" />
                Historique & Factures
              </Button>
            </div>
            <SubscriptionCard
              subscription={{
                start_date: activeSubscription.start_date,
                end_date: activeSubscription.end_date,
                is_active: activeSubscription.is_active,
                ai_credits_remaining:
                  activeSubscription.ai_credits_remaining ?? 0,
                plan: activePlan
                  ? {
                      name: activePlan.name,
                      type: activePlan.type,
                      ai_credits: activePlan.ai_credits,
                    }
                  : null,
              }}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                icon={CreditCard}
                title="Aucun abonnement actif"
                description="Souscrivez à un plan pour commencer votre préparation"
              />
              <Button
                className="w-full mt-4"
                onClick={() => setShowPlansDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Souscrire à un plan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Plans disponibles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Plans disponibles</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPlansDialog(true)}
            >
              Voir tous les plans
            </Button>
          </div>

          {plansLoading ? (
            <LoadingSpinner text="Chargement des plans..." />
          ) : plans && plans.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.slice(0, 3).map((plan) => (
                <PricingCard key={plan.id} plan={plan} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucun plan disponible
            </p>
          )}
        </div>

        {/* Informations */}
        <Card>
          <CardHeader>
            <CardTitle>Informations importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>Renouvellement:</strong> Votre abonnement se renouvelle
              automatiquement à la fin de la période.
            </div>
            <div>
              <strong>Crédits IA:</strong> Les crédits non utilisés sont perdus
              à l'expiration de l'abonnement.
            </div>
            <div>
              <strong>Annulation:</strong> Vous pouvez annuler votre abonnement
              à tout moment depuis votre espace.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Plans */}
      {/* <Dialog open={showPlansDialog} onOpenChange={setShowPlansDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choisir un plan</DialogTitle>
            <DialogDescription>
              Sélectionnez le plan qui correspond le mieux à vos besoins
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            {plans?.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog> */}
    </>
  );
}
