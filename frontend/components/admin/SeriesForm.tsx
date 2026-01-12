"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  seriesCreateSchema,
  seriesUpdateSchema,
  SeriesCreateFormData,
  SeriesUpdateFormData,
} from "@/lib/validators/series";
import {
  useCreateSeries,
  useUpdateSeries,
} from "@/hooks/mutations/useSeriesMutations";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SeriesFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series?: {
    id: string;
    number: number;
    title: string | null;
    is_active: boolean;
  };
  mode: "create" | "edit";
}

export default function SeriesForm({
  open,
  onOpenChange,
  series,
  mode,
}: SeriesFormProps) {
  const { mutate: createSeries, isPending: isCreating } = useCreateSeries();
  const { mutate: updateSeries, isPending: isUpdating } = useUpdateSeries();

  const isPending = isCreating || isUpdating;

  const form = useForm<SeriesCreateFormData | SeriesUpdateFormData>({
    resolver: zodResolver(
      mode === "create" ? seriesCreateSchema : seriesUpdateSchema
    ),
    defaultValues:
      mode === "edit" && series
        ? {
            title: series.title || "",
            is_active: series.is_active,
          }
        : {
            number: 1,
            title: "",
            is_active: true,
          },
  });

  const onSubmit = (data: SeriesCreateFormData | SeriesUpdateFormData) => {
    if (mode === "create") {
      createSeries(data as SeriesCreateFormData, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    } else if (series) {
      updateSeries(
        {
          seriesId: series.id,
          data: data as SeriesUpdateFormData,
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
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Créer une série" : "Modifier la série"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Créer une nouvelle série d'examen TCF Canada"
              : "Modifier les informations de la série"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Number (create only) */}
            {mode === "create" && (
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de série *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="149"
                        disabled={isPending}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Numéro unique de la série (ex: 149, 150, 151...)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Série spéciale 2025"
                      disabled={isPending}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Titre descriptif optionnel pour la série
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Série active</FormLabel>
                    <FormDescription>
                      Les étudiants peuvent accéder aux séries actives
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
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
                ) : mode === "create" ? (
                  "Créer la série"
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
