import {
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X,
  Calendar,
  Zap,
} from "lucide-react";
import { PlanListResponse, PlanType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PlanCardProps {
  plan: PlanListResponse;
  onEdit: (plan: PlanListResponse) => void;
  onDelete: (planId: string) => void;
}

export default function PlanCard({ plan, onEdit, onDelete }: PlanCardProps) {
  const getTypeBadge = (type: PlanType) => {
    const config = {
      [PlanType.B2C]: {
        label: "B2C - Individuel",
        variant: "default" as const,
      },
      [PlanType.B2B_CENTER]: {
        label: "B2B - Centre",
        variant: "secondary" as const,
      },
      [PlanType.B2B_RESELLER]: {
        label: "B2B - Revendeur",
        variant: "outline" as const,
      },
    };
    return config[type];
  };

  const typeBadge = getTypeBadge(plan.type);
  const pricePerMonth =
    plan.duration_days >= 30
      ? (plan.price / Math.floor(plan.duration_days / 30)).toFixed(0)
      : null;

  // Extraire les features du JSON
  const features = plan.features || {};
  const featuresList = Object.entries(features).map(([key, value]) => ({
    name: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    included: !!value,
  }));

  return (
    <Card className={!plan.is_active ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="flex items-center gap-2">
              {plan.name}
              {!plan.is_active && (
                <Badge variant="secondary" className="text-xs">
                  Inactif
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(plan)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(plan.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Badge variant={typeBadge.variant} className="w-fit">
          {typeBadge.label}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Prix */}
        <div className="text-center py-4 bg-muted rounded-lg">
          <div className="text-4xl font-bold">
            {plan.price.toLocaleString()} F
          </div>
          {pricePerMonth && (
            <p className="text-sm text-muted-foreground mt-1">
              ~{pricePerMonth} F/mois
            </p>
          )}
        </div>

        <Separator />

        {/* Infos */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Durée</p>
              <p className="text-sm text-muted-foreground">
                {plan.duration_days} jours
                {plan.duration_days >= 30 &&
                  ` (~${Math.floor(plan.duration_days / 30)} mois)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Crédits IA</p>
              <p className="text-sm text-muted-foreground">
                {plan.ai_credits} crédits
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        {featuresList.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Fonctionnalités</p>
              {featuresList.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {feature.included ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={
                      feature.included
                        ? ""
                        : "line-through text-muted-foreground"
                    }
                  >
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      {plan.is_active && (
        <CardFooter>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onEdit(plan)}
          >
            Voir les détails
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
