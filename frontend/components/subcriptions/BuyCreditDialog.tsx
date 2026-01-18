"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { useCreditPricing } from "@/hooks/queries/useAICreditsQueries";
import { usePurchaseCredits } from "@/hooks/mutations/useAICreditsMutations";
import { PaymentMethod } from "@/lib/api";
import {
  PurchaseCreditsInput,
  purchaseCreditsSchema,
} from "@/lib/validators/ai-credits";

interface BuyCreditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BuyCreditDialog({
  open,
  onOpenChange,
}: BuyCreditDialogProps) {
  const { data: pricing } = useCreditPricing();
  const { mutate: purchaseCredits, isPending } = usePurchaseCredits();

  const form = useForm<PurchaseCreditsInput>({
    resolver: zodResolver(purchaseCreditsSchema),
    defaultValues: {
      credits: 50,
      payment_method: "" as PaymentMethod,
      phone_number: "",
    },
  });

  const creditsValue = form.watch("credits");
  const paymentMethod = form.watch("payment_method");

  const totalAmount = creditsValue * (pricing?.price_per_credit || 50);

  const onSubmit = (data: PurchaseCreditsInput) => {
    purchaseCredits(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Acheter des crédits IA
          </DialogTitle>
          <DialogDescription>
            {pricing?.price_per_credit} FCFA par crédit • Min:{" "}
            {pricing?.min_purchase} • Max: {pricing?.max_purchase}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Quantité de crédits */}
            <FormField
              control={form.control}
              name="credits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de crédits</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ex: 50"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />

                  {/* Montant calculé */}
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">
                      Montant à payer :{" "}
                      <span className="text-lg font-bold text-primary">
                        {totalAmount.toLocaleString()} FCFA
                      </span>
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Méthode de paiement */}
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Méthode de paiement</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted">
                        <RadioGroupItem
                          value={PaymentMethod.MOBILE_MONEY}
                          id="mobile"
                        />
                        <Label
                          htmlFor="mobile"
                          className="flex-1 cursor-pointer"
                        >
                          Mobile Money (MTN, Orange)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted">
                        <RadioGroupItem value={PaymentMethod.CARD} id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          Carte bancaire (Visa, Mastercard)
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Numéro de téléphone (conditionnel) */}
            {paymentMethod === PaymentMethod.MOBILE_MONEY && (
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 691234567"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  `Payer ${totalAmount.toLocaleString()} FCFA`
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
