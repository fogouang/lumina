"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "@/components/ui/button";
import { PlanListResponse } from "@/lib/api";
import { FeaturesList } from "./FeaturesList";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";

interface PricingCardProps {
  plan: PlanListResponse;
}

export default function PricingCard({ plan }: PricingCardProps) {
  const router = useRouter();

  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(plan.price);

  const durationText =
    plan.duration_days >= 30
      ? `${Math.floor(plan.duration_days / 30)} mois`
      : `${plan.duration_days} jours`;

  const handleChoosePlan = () => {
    // Rediriger vers checkout avec l'ID du plan
    router.push(ROUTES.CHECKOUT_PAYMENTS(plan.id));
  };

  return (
    <Card className="flex flex-col relative">
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>
          {plan.description || `Accès pendant ${durationText}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-8">
          <div className="text-3xl lg:text-4xl font-bold">{formattedPrice}</div>
          <div className="text-sm text-muted-foreground mt-1">
            pour {durationText}
          </div>
        </div>
        <CardFooter>
          <Button className="w-full mb-4" size="lg" onClick={handleChoosePlan}>
            Choisir ce plan
          </Button>
        </CardFooter>
        {/* Utiliser le composant FeaturesList */}
        {plan.features && Object.keys(plan.features).length > 0 ? (
          <FeaturesList features={plan.features} showDisabled={true} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Accès complet à toutes les séries
          </p>
        )}

        {plan.ai_credits > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {plan.ai_credits} crédits IA inclus
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
