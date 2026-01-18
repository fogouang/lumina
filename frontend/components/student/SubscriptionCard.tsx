import { Zap, Clock, Plus } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DateDisplay from "@/components/shared/DateDisplay";
import { SubscriptionResponse } from "@/lib/api/models/SubscriptionResponse";
import { PlanType } from "@/lib/api";
import BuyCreditDialog from "../subcriptions/BuyCreditDialog";
import { cn } from "@/lib/utils";

type SubscriptionDisplay = Pick<
  SubscriptionResponse,
  "start_date" | "end_date" | "is_active" | "ai_credits_remaining"
> & {
  plan?: {
    name: string;
    type?: PlanType;
    ai_credits?: number;
  } | null;
};

interface SubscriptionCardProps {
  subscription: SubscriptionDisplay;
  onRenew?: () => void;
}

export default function SubscriptionCard({
  subscription,
  onRenew,
}: SubscriptionCardProps) {
  const [showBuyDialog, setShowBuyDialog] = useState(false);

  // Protection contre les dates invalides + calcul plus robuste
  const endDate = new Date(subscription.end_date);
  const now = new Date();
  const daysRemaining = subscription.is_active
    ? Math.max(
        0,
        Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      )
    : 0;

  const creditsRemaining = subscription.ai_credits_remaining ?? 0;
  // Si le plan n'a pas de ai_credits défini, on utilise la valeur restante comme total (cas fallback)
  const creditsTotal = subscription.plan?.ai_credits ?? creditsRemaining;
  const creditsPercentage =
    creditsTotal > 0
      ? Math.min(100, Math.round((creditsRemaining / creditsTotal) * 100))
      : 0;

  const hasLowCredits = creditsRemaining > 0 && creditsRemaining <= 10;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="line-clamp-1">
              {subscription.plan?.name || "Abonnement actuel"}
            </span>
            <Badge variant={subscription.is_active ? "default" : "secondary"}>
              {subscription.is_active ? "Actif" : "Expiré"}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Début</p>
              <DateDisplay date={subscription.start_date} formatStr="short" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Fin</p>
              <DateDisplay date={subscription.end_date} formatStr="short" />
            </div>
          </div>

          {/* Jours restants */}
          {subscription.is_active && daysRemaining > 0 && (
            <div className="flex items-center gap-2 bg-muted/60 p-3 rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {daysRemaining} jour{daysRemaining > 1 ? "s" : ""} restant
                {daysRemaining > 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Crédits IA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Crédits IA</span>
              </div>
              <span className="text-lg font-bold tabular-nums">
                {creditsRemaining} / {creditsTotal}
              </span>
            </div>

            <Progress
              value={creditsPercentage}
              className={cn(
                "h-2",
                hasLowCredits ? "bg-yellow-100" : "bg-primary/20",
                "[&>div]:transition-all",
                hasLowCredits ? "[&>div]:bg-yellow-500" : "[&>div]:bg-primary",
              )}
            />

            <p className="text-xs text-muted-foreground">
              Crédits de correction restants
            </p>

            {/* Bouton acheter */}
            {subscription.is_active && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-1"
                onClick={() => setShowBuyDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Acheter des crédits
              </Button>
            )}

            {/* Alerte crédits faibles */}
            {hasLowCredits && subscription.is_active && (
              <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm">
                <p className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ Attention : il ne vous reste que {creditsRemaining} crédit
                  {creditsRemaining > 1 ? "s" : ""} !
                </p>
              </div>
            )}
          </div>

          {/* Renouveler */}
          {!subscription.is_active && onRenew && (
            <Button className="w-full" onClick={onRenew}>
              Renouveler l'abonnement
            </Button>
          )}
        </CardContent>
      </Card>

      <BuyCreditDialog open={showBuyDialog} onOpenChange={setShowBuyDialog} />
    </>
  );
}
