import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  // Exam attempts
  in_progress: { label: "En cours", variant: "default" },
  completed: { label: "Terminé", variant: "secondary" },
  abandoned: { label: "Abandonné", variant: "destructive" },

  // Corrections
  pending: { label: "En attente", variant: "outline" },
  corrected_ai: { label: "Corrigé IA", variant: "default" },
  corrected_manual: { label: "Corrigé", variant: "secondary" },

  // Payments
  success: { label: "Payé", variant: "secondary" },
  failed: { label: "Échoué", variant: "destructive" },
  cancelled: { label: "Annulé", variant: "outline" },

  // Subscriptions
  active: { label: "Actif", variant: "secondary" },
  expired: { label: "Expiré", variant: "destructive" },
  cancelled_sub: { label: "Annulé", variant: "outline" },

  // General
  enabled: { label: "Activé", variant: "secondary" },
  disabled: { label: "Désactivé", variant: "outline" },
};

export default function StatusBadge({
  status,
  variant,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    variant: "default" as const,
  };

  return (
    <Badge
      variant={variant || config.variant}
      className={cn("", className)}
    >
      {config.label}
    </Badge>
  );
}