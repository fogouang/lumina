"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  useCreateOrganization,
  useUpdateOrganization,
} from "@/hooks/mutations/useOrganizationsMutations";
import { OrganizationType, OrganizationListResponse } from "@/lib/api";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  OrganizationCreateFormData,
  OrganizationUpdateFormData,
  organizationCreateSchema,
  organizationUpdateSchema,
} from "@/lib/validators/organizations";

// Type étendu pour inclure les champs optionnels
type OrganizationFormData = OrganizationListResponse & {
  phone?: string | null;
  address?: string | null;
};

interface OrganizationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: OrganizationFormData;
  mode: "create" | "edit";
}

export default function OrganizationForm({
  open,
  onOpenChange,
  organization,
  mode,
}: OrganizationFormProps) {
  const { mutate: createOrganization, isPending: isCreating } =
    useCreateOrganization();
  const { mutate: updateOrganization, isPending: isUpdating } =
    useUpdateOrganization();

  const isPending = isCreating || isUpdating;

  const form = useForm<OrganizationCreateFormData | OrganizationUpdateFormData>(
    {
      resolver: zodResolver(
        mode === "create" ? organizationCreateSchema : organizationUpdateSchema
      ),
      defaultValues:
        mode === "edit" && organization
          ? {
              name: organization.name,
              email: organization.email,
              phone: organization.phone || "",
              address: organization.address || "",
              is_active: organization.is_active,
            }
          : {
              name: "",
              type: OrganizationType.TRAINING_CENTER,
              email: "",
              phone: "",
              address: "",
              is_active: true,
            },
    }
  );

  const onSubmit = (
    data: OrganizationCreateFormData | OrganizationUpdateFormData
  ) => {
    if (mode === "create") {
      createOrganization(data as OrganizationCreateFormData, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    } else if (organization) {
      updateOrganization(
        {
          orgId: organization.id,
          data: data as OrganizationUpdateFormData,
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
            {mode === "create"
              ? "Créer une organisation"
              : "Modifier l'organisation"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Ajouter une nouvelle organisation (centre de formation ou revendeur)"
              : "Modifier les informations de l'organisation"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'organisation *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Centre de Formation Excellence"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type (create only) */}
            {mode === "create" && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'organisation *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={OrganizationType.TRAINING_CENTER}>
                          Centre de formation
                        </SelectItem>
                        <SelectItem value={OrganizationType.RESELLER}>
                          Revendeur
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Détermine les fonctionnalités disponibles
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contact@organisation.com"
                      disabled={isPending}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+237 6XX XX XX XX"
                      disabled={isPending}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>8-15 chiffres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adresse complète de l'organisation"
                      disabled={isPending}
                      {...field}
                      value={field.value || ""}
                      rows={3}
                    />
                  </FormControl>
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
                    <FormLabel className="text-base">
                      Organisation active
                    </FormLabel>
                    <FormDescription>
                      L'organisation peut accéder à la plateforme
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? true}
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
                  "Créer l'organisation"
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
