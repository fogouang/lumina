import { Badge } from "@/components/ui/badge";

// Type des niveaux CECRL possibles
type CECRLLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "N/A";

interface CECRLBadgeProps {
  level?: string | null;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
  variant?: "default" | "compact";
}

const CECRL_CONFIG = {
  A1: {
    label: "A1 - Débutant",
    compact: "A1",
    description: "Utilisateur élémentaire (découverte)",
    color: "bg-slate-500 hover:bg-slate-600",
    textColor: "text-white",
  },
  A2: {
    label: "A2 - Élémentaire",
    compact: "A2",
    description: "Utilisateur élémentaire (survie)",
    color: "bg-blue-500 hover:bg-blue-600",
    textColor: "text-white",
  },
  B1: {
    label: "B1 - Intermédiaire",
    compact: "B1",
    description: "Utilisateur indépendant (seuil)",
    color: "bg-green-500 hover:bg-green-600",
    textColor: "text-white",
  },
  B2: {
    label: "B2 - Avancé",
    compact: "B2",
    description: "Utilisateur indépendant (avancé)",
    color: "bg-yellow-500 hover:bg-yellow-600",
    textColor: "text-white",
  },
  C1: {
    label: "C1 - Autonome",
    compact: "C1",
    description: "Utilisateur expérimenté (autonome)",
    color: "bg-orange-500 hover:bg-orange-600",
    textColor: "text-white",
  },
  C2: {
    label: "C2 - Maîtrise",
    compact: "C2",
    description: "Utilisateur expérimenté (maîtrise)",
    color: "bg-red-500 hover:bg-red-600",
    textColor: "text-white",
  },
  "N/A": {
    label: "N/A",
    compact: "N/A",
    description: "Non évalué",
    color: "bg-muted hover:bg-muted/80",
    textColor: "text-muted-foreground",
  },
};

export default function CECRLBadge({
  level,
  size = "md",
  showDescription = false,
  variant = "default",
}: CECRLBadgeProps) {
  // Normaliser le niveau (au cas où le backend envoie en minuscules ou autre)
  const normalizedLevel = (level?.toString().toUpperCase() ||
    "N/A") as CECRLLevel;
  const config = CECRL_CONFIG[normalizedLevel] || CECRL_CONFIG["N/A"];

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const displayText = variant === "compact" ? config.compact : config.label;

  if (showDescription) {
    return (
      <div className="inline-flex flex-col gap-1">
        <Badge
          className={`${sizeClasses[size]} font-bold ${config.color} ${config.textColor} border-0`}
        >
          {displayText}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {config.description}
        </span>
      </div>
    );
  }

  return (
    <Badge
      className={`${sizeClasses[size]} font-bold ${config.color} ${config.textColor} border-0`}
    >
      {displayText}
    </Badge>
  );
}
