"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X, Check } from "lucide-react";
import { planCreateSchema, PlanCreateFormData } from "@/lib/validators/plans";
import {
  useCreatePlan,
  useUpdatePlan,
} from "@/hooks/mutations/usePlansMutations";
import { PlanListResponse, PlanType } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { AVAILABLE_FEATURES } from "@/lib/constants/features";

interface PlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: PlanListResponse;
  mode: "create" | "edit";
}

// Features prédéfinies

export default function PlanForm({
  open,
  onOpenChange,
  plan,
  mode,
}: PlanFormProps) {
  const { mutate: createPlan, isPending: isCreating } = useCreatePlan();
  const { mutate: updatePlan, isPending: isUpdating } = useUpdatePlan();

  const [selectedFeatures, setSelectedFeatures] = useState<
    Record<string, boolean>
  >({});

  const isPending = isCreating || isUpdating;

  const form = useForm<PlanCreateFormData>({
    resolver: zodResolver(planCreateSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      type: PlanType.B2C,
      price: 0,
      duration_days: 30,
      ai_credits: 0,
      features: {},
      is_active: true,
    },
  });

  // Charger les données du plan en mode édition
  useEffect(() => {
    if (plan && mode === "edit") {
      form.reset({
        name: plan.name,
        description: plan.description || "",
        type: plan.type,
        price: plan.price,
        duration_days: plan.duration_days,
        ai_credits: plan.ai_credits,
        features: plan.features || {},
        is_active: plan.is_active,
      });
      setSelectedFeatures(plan.features || {});
    } else {
      form.reset({
        name: "",
        description: "",
        type: PlanType.B2C,
        price: 0,
        duration_days: 30,
        ai_credits: 0,
        features: {},
        is_active: true,
      });
      setSelectedFeatures({});
    }
  }, [plan, mode, form]);

  const toggleFeature = (key: string) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const onSubmit = (data: PlanCreateFormData) => {
    // Ajouter les features sélectionnées
    const finalData = {
      ...data,
      features: selectedFeatures,
    };

    if (mode === "create") {
      createPlan(finalData, {
        onSuccess: () => {
          form.reset();
          setSelectedFeatures({});
          onOpenChange(false);
        },
      });
    } else if (plan) {
      updatePlan(
        {
          planId: plan.id,
          data: finalData,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Créer un plan" : "Modifier le plan"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Créer un nouveau plan d'abonnement"
              : "Modifier les informations du plan"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nom */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du plan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Formule Rapide"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Idéal pour compléter sa préparation..."
                      rows={3}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            {mode === "create" && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de plan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PlanType.B2C}>
                          B2C - Individuel
                        </SelectItem>
                        <SelectItem value={PlanType.B2B_CENTER}>
                          B2B - Centre
                        </SelectItem>
                        <SelectItem value={PlanType.B2B_RESELLER}>
                          B2B - Revendeur
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Prix et Durée */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix (FCFA)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isPending}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (jours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isPending}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {field.value >= 30 &&
                        `~${Math.floor(field.value / 30)} mois`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Crédits IA */}
            <FormField
              control={form.control}
              name="ai_credits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crédits IA</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={isPending}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Nombre de crédits IA inclus dans le plan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Fonctionnalités */}
            <div className="space-y-3">
              <Label>Fonctionnalités incluses</Label>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_FEATURES.map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-muted"
                    onClick={() => toggleFeature(feature.key)}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded border">
                      {selectedFeatures[feature.key] && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <label className="text-sm cursor-pointer flex-1">
                      {feature.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Actif */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Plan actif</FormLabel>
                    <FormDescription>
                      Le plan sera visible et disponible à l'achat
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "create" ? "Création..." : "Mise à jour..."}
                  </>
                ) : (
                  <>
                    {mode === "create" ? (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Créer le plan
                      </>
                    ) : (
                      "Mettre à jour"
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
