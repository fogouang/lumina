import { AVAILABLE_FEATURES } from "@/lib/constants/features";
import { Check, X } from "lucide-react";

interface FeaturesListProps {
  features: Record<string, any>;
  showDisabled?: boolean;
}

export function FeaturesList({
  features,
  showDisabled = false,
}: FeaturesListProps) {
  return (
    <ul className="space-y-3">
      {AVAILABLE_FEATURES.map((feature) => {
        const value = features[feature.key];
        const rendered = renderFeature({
          feature,
          value,
          showOnlyEnabled: !showDisabled,
        });

        if (!rendered) return null;

        return (
          <li key={feature.key} className="flex items-start gap-3">
            {rendered.enabled ? (
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            )}
            <span
              className={`text-sm ${
                !rendered.enabled ? "text-muted-foreground line-through" : ""
              }`}
            >
              {rendered.text}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

interface RenderFeatureOptions {
  feature: (typeof AVAILABLE_FEATURES)[0];
  value: any;
  showOnlyEnabled?: boolean;
}

function renderFeature({
  feature,
  value,
  showOnlyEnabled = false,
}: RenderFeatureOptions) {
  // Si c'est un compteur
  if (feature.type === "counter" && typeof value === "number") {
    if (value > 0) {
      return {
        enabled: true,
        text: `${value} ${feature.label}`,
      };
    }
    return null;
  }

  // Si c'est un boolean
  if (typeof value === "boolean") {
    if (showOnlyEnabled && !value) {
      return null;
    }
    return {
      enabled: value,
      text: feature.label,
    };
  }

  return null;
}
