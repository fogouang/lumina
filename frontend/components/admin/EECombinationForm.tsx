"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EECombinationResponse, EECombinationCreate } from "@/lib/api";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateEECombination, useUpdateEECombination } from "@/hooks/mutations/useSessionsMutations";

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(500),
  order: z.coerce.number().min(0).default(0),

  // Tâche 1
  task1_instruction: z.string().min(10, "Minimum 10 caractères"),
  task1_word_min: z.coerce.number().min(40).max(100).default(60),
  task1_word_max: z.coerce.number().min(60).max(120).default(80),

  // Tâche 2
  task2_instruction: z.string().min(10, "Minimum 10 caractères"),
  task2_word_min: z.coerce.number().min(100).max(150).default(120),
  task2_word_max: z.coerce.number().min(120).max(180).default(150),

  // Tâche 3
  task3_title: z.string().min(1, "Le titre est requis").max(500),
  task3_document_1: z.string().min(10, "Minimum 10 caractères"),
  task3_document_2: z.string().min(10, "Minimum 10 caractères"),
  task3_word_min: z.coerce.number().min(140).max(180).default(160),
  task3_word_max: z.coerce.number().min(160).max(200).default(180),
});

type FormData = z.infer<typeof formSchema>;

interface EECombinationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId?: string;
  combination?: EECombinationResponse;
}

export default function EECombinationForm({
  open,
  onOpenChange,
  sessionId,
  combination,
}: EECombinationFormProps) {
  const isEditing = !!combination;

  const { mutate: createCombination, isPending: isCreating } =
    useCreateEECombination();
  const { mutate: updateCombination, isPending: isUpdating } =
    useUpdateEECombination();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: "",
      order: 0,
      task1_instruction: "",
      task1_word_min: 60,
      task1_word_max: 80,
      task2_instruction: "",
      task2_word_min: 120,
      task2_word_max: 150,
      task3_title: "",
      task3_document_1: "",
      task3_document_2: "",
      task3_word_min: 160,
      task3_word_max: 180,
    },
  });

  useEffect(() => {
    if (combination) {
      form.reset({
        title: combination.title,
        order: combination.order,
        task1_instruction: combination.task1_instruction,
        task1_word_min: combination.task1_word_min,
        task1_word_max: combination.task1_word_max,
        task2_instruction: combination.task2_instruction,
        task2_word_min: combination.task2_word_min,
        task2_word_max: combination.task2_word_max,
        task3_title: combination.task3_title,
        task3_document_1: combination.task3_document_1,
        task3_document_2: combination.task3_document_2,
        task3_word_min: combination.task3_word_min,
        task3_word_max: combination.task3_word_max,
      });
    }
  }, [combination, form]);

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateCombination(
        {
          combinationId: combination.id,
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
      createCombination(
        {
          sessionId,
          data: data as EECombinationCreate,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la combinaison" : "Nouvelle combinaison EE"}
          </DialogTitle>
          <DialogDescription>
            Configurez les 3 tâches d'expression écrite
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Titre et ordre */}
            <div className="grid gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>Titre général</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: La Télévision Dans l'Éducation Des Enfants"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordre</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tabs pour les 3 tâches */}
            <Tabs defaultValue="task1" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="task1">Tâche 1</TabsTrigger>
                <TabsTrigger value="task2">Tâche 2</TabsTrigger>
                <TabsTrigger value="task3">Tâche 3</TabsTrigger>
              </TabsList>

              {/* Tâche 1 */}
              <TabsContent value="task1" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="task1_instruction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consigne Tâche 1</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez la consigne..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="task1_word_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mots minimum</FormLabel>
                        <FormControl>
                          <Input type="number" min="40" max="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="task1_word_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mots maximum</FormLabel>
                        <FormControl>
                          <Input type="number" min="60" max="120" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Tâche 2 */}
              <TabsContent value="task2" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="task2_instruction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consigne Tâche 2</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez la consigne..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="task2_word_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mots minimum</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="100"
                            max="150"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="task2_word_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mots maximum</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="120"
                            max="180"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Tâche 3 */}
              <TabsContent value="task3" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="task3_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du débat</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: La Chasse Aux Animaux : Pour ou Contre ?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="task3_document_1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document 1</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Témoignage ou citation..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="task3_document_2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document 2</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Témoignage ou citation..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="task3_word_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mots minimum (argumentative)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="140"
                            max="180"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="task3_word_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mots maximum (argumentative)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="160"
                            max="200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

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