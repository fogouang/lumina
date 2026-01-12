import { Zap, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import DateDisplay from "@/components/shared/DateDisplay";
import { SubscriptionResponse } from "@/lib/api/models/SubscriptionResponse";

interface SubscriptionCardProps {
  subscription: SubscriptionResponse;
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

  // ✅ On ne peut plus calculer le pourcentage car on n'a pas le total
  // On affiche juste le nombre restant

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>Mon abonnement</CardTitle>
          <Badge variant={subscription.is_active ? "default" : "secondary"}>
            {subscription.is_active ? "Actif" : "Expiré"}
          </Badge>
        </div>
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Crédits IA</span>
            </div>
            <span className="text-sm font-bold">
              {subscription.ai_credits_remaining}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Crédits de correction restants
          </p>
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