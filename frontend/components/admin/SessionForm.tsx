"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MonthlySessionResponse, MonthlySessionCreate } from "@/lib/api";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateSession, useUpdateSession } from "@/hooks/mutations/useSessionsMutations";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  month: z.string().regex(/^\d{4}-\d{2}-01$/, "Format invalide (YYYY-MM-01)"),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface SessionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: MonthlySessionResponse;
  mode: "create" | "edit";
}

export default function SessionForm({
  open,
  onOpenChange,
  session,
  mode,
}: SessionFormProps) {
  const isEditing = mode === "edit";

  const { mutate: createSession, isPending: isCreating } = useCreateSession();
  const { mutate: updateSession, isPending: isUpdating } = useUpdateSession();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      month: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (session) {
      // Convert date to YYYY-MM-DD format
      const monthDate = new Date(session.month);
      const monthStr = monthDate.toISOString().split("T")[0];

      form.reset({
        name: session.name,
        month: monthStr,
        is_active: session.is_active,
      });
    } else {
      // Default to current month, first day
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

      form.reset({
        name: "",
        month: currentMonth,
        is_active: true,
      });
    }
  }, [session, form]);

  const onSubmit = (data: FormData) => {
    if (isEditing && session) {
      // Pour l'édition, on n'envoie que les champs modifiables
      updateSession(
        {
          sessionId: session.id,
          data: {
            name: data.name,
            is_active: data.is_active,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        },
      );
    } else {
      createSession(
        {
          name: data.name,
          month: data.month,
        } as MonthlySessionCreate,
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la session" : "Nouvelle session mensuelle"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de la session"
              : "Créez une nouvelle session pour un mois académique"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la session</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Janvier 2026" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nom affiché pour identifier la session
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mois</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={isEditing} {...field} />
                  </FormControl>
                  <FormDescription>
                    {isEditing
                      ? "Le mois ne peut pas être modifié"
                      : "Choisissez le premier jour du mois"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Session active
                      </FormLabel>
                      <FormDescription>
                        Les utilisateurs peuvent voir cette session
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating
                  ? "Enregistrement..."
                  : isEditing
                    ? "Mettre à jour"
                    : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
