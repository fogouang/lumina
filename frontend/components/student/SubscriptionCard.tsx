import { Zap, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DateDisplay from "@/components/shared/DateDisplay";
import { SubscriptionResponse } from "@/lib/api/models/SubscriptionResponse";
import { PlanType } from "@/lib/api";

type SubscriptionDisplay = Pick<
  SubscriptionResponse,
  "start_date" | "end_date" | "is_active" | "ai_credits_remaining"
> & { plan?: { name: string; type?: PlanType; ai_credits?: number } | null };

interface SubscriptionCardProps {
  subscription: SubscriptionDisplay;
  onRenew?: () => void;
}

export default function SubscriptionCard({
  subscription,
  onRenew,
}: SubscriptionCardProps) {
  const daysRemaining = Math.ceil(
    (new Date(subscription.end_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const creditsRemaining = subscription.ai_credits_remaining ?? 0;
  const creditsTotal = subscription.plan?.ai_credits ?? creditsRemaining;
  const creditsPercentage =
    creditsTotal > 0 ? Math.round((creditsRemaining / creditsTotal) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{subscription.plan?.name || "Mon abonnement"}</span>
          <Badge variant={subscription.is_active ? "default" : "secondary"}>
            {subscription.is_active ? "Actif" : "Expiré"}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
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
          <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
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
            <span className="text-lg font-bold">
              {creditsRemaining} / {creditsTotal}
            </span>
          </div>
          <Progress value={creditsPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Crédits de correction restants
          </p>

          {/* Alerte crédits faibles */}
          {creditsRemaining < 10 && subscription.is_active && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <p className="text-xs text-yellow-800">
                ⚠️ Il vous reste peu de crédits IA
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
  );
}
