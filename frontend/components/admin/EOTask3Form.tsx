"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EOTask3Response, EOTask3Create } from "@/lib/api";

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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateEOTask3, useUpdateEOTask3 } from "@/hooks/mutations/useSessionsMutations";

const formSchema = z.object({
  subject: z.string().min(10, "Minimum 10 caractères requis"),
  order: z.coerce.number().min(0).default(0),
});

type FormData = z.infer<typeof formSchema>;

interface EOTask3FormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId?: string;
  task?: EOTask3Response;
}

export default function EOTask3Form({
  open,
  onOpenChange,
  sessionId,
  task,
}: EOTask3FormProps) {
  const isEditing = !!task;

  const { mutate: createTask, isPending: isCreating } = useCreateEOTask3();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateEOTask3();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      subject: "",
      order: 0,
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        subject: task.subject,
        order: task.order,
      });
    } else {
      form.reset({
        subject: "",
        order: 0,
      });
    }
  }, [task, form]);

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateTask(
        {
          taskId: task.id,
          data,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else if (sessionId) {
      createTask(
        {
          sessionId,
          data: data as EOTask3Create,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le sujet" : "Nouveau sujet - Tâche 3"}
          </DialogTitle>
          <DialogDescription>
            Exercice en interaction (4-5 minutes)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sujet</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Gouvernements 50/50 hommes-femmes : Qu'en pensez-vous ?"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Le candidat devra défendre son point de vue lors d'une
                    interaction de 4-5 minutes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordre d'affichage</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Position dans le pool de sujets
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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