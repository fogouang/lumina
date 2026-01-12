import { Calendar, User, CreditCard, Zap, Building2 } from "lucide-react";
import { SubscriptionResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DateDisplay from "@/components/shared/DateDisplay";

interface SubscriptionCardProps {
  subscription: SubscriptionResponse;
}

export default function SubscriptionCard({
  subscription,
}: SubscriptionCardProps) {
  const isActive = subscription.is_active;
  const daysRemaining = Math.ceil(
    (new Date(subscription.end_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Card className={!isActive ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {subscription.organization_id ? (
              <>
                <Building2 className="h-4 w-4" />
                Souscription Organisation
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                Souscription Individuelle
              </>
            )}
          </CardTitle>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Actif" : "Expiré"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Début</p>
            <DateDisplay date={subscription.start_date} formatStr="short" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fin</p>
            <DateDisplay date={subscription.end_date} formatStr="short" />
          </div>
        </div>

        {isActive && daysRemaining > 0 && (
          <div className="bg-muted p-2 rounded text-center">
            <p className="text-sm font-medium">
              {daysRemaining} jour{daysRemaining > 1 ? "s" : ""} restant
              {daysRemaining > 1 ? "s" : ""}
            </p>
          </div>
        )}

        <Separator />

        {/* Crédits IA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Crédits IA</span>
          </div>
          <span className="text-sm font-medium">
            {subscription.ai_credits_remaining}
          </span>
        </div>

        {/* IDs (debug) */}
        <div className="pt-2 space-y-1">
          <p className="text-xs text-muted-foreground">
            Plan:{" "}
            <code className="text-xs">
              {subscription.plan_id.slice(0, 8)}...
            </code>
          </p>
          {subscription.organization_id && (
            <p className="text-xs text-muted-foreground">
              Org:{" "}
              <code className="text-xs">
                {subscription.organization_id.slice(0, 8)}...
              </code>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
