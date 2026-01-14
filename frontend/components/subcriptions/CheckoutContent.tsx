"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { usePlanDetail } from "@/hooks/queries/usePlansQueries";
import { useSubscribeB2C } from "@/hooks/mutations/useSubscriptionsMutations";
import { useInitiatePayment } from "@/hooks/mutations/usePaymentsMutations";
import { PaymentMethod } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2 } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ErrorState from "@/components/shared/ErrorState";

export default function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.MOBILE_MONEY
  );

  // Mobile Money
  const [phoneNumber, setPhoneNumber] = useState("");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  const {
    data: plan,
    isLoading: isLoadingPlan,
    error: planError,
  } = usePlanDetail(planId || "");

  const subscribeMutation = useSubscribeB2C();
  const initiatePaymentMutation = useInitiatePayment();

  const isProcessing =
    subscribeMutation.isPending || initiatePaymentMutation.isPending;

  if (isLoadingPlan) {
    return <LoadingSpinner className="py-8" text="Chargement du plan..." />;
  }

  if (planError || !plan || !planId) {
    return <ErrorState message="Plan introuvable ou erreur de chargement." />;
  }

  // === Validation Helpers ===
  const isPhoneValid =
    phoneNumber.trim().length >= 9 && /^\d+$/.test(phoneNumber.trim());

  const cleanCardNumber = cardNumber.replace(/\s/g, "");
  const isCardNumberValid = /^\d{16}$/.test(cleanCardNumber); // 16 chiffres

  const cleanExpiry = cardExpiry.replace(/\D/g, "");
  const isExpiryValid =
    /^(\d{2})(\d{2})$/.test(cleanExpiry) &&
    parseInt(cleanExpiry.slice(0, 2)) >= 1 &&
    parseInt(cleanExpiry.slice(0, 2)) <= 12 &&
    parseInt(cleanExpiry.slice(2, 4)) >= 26; // année >= 2026

  const isCvcValid = /^\d{3,4}$/.test(cardCvc.trim());
  const isCardHolderValid = cardHolder.trim().length >= 3;

  const isMobileFormValid =
    paymentMethod === PaymentMethod.MOBILE_MONEY ? isPhoneValid : true;
  const isCardFormValid =
    paymentMethod === PaymentMethod.CARD
      ? isCardNumberValid && isExpiryValid && isCvcValid && isCardHolderValid
      : true;

  const isFormValid = isMobileFormValid && isCardFormValid;

  // === Formatage visuel carte ===
  const formatCardNumber = (value: string) => {
    return (
      value
        .replace(/\D/g, "")
        .slice(0, 16)
        .match(/.{1,4}/g)
        ?.join(" ") || ""
    );
  };

  const formatExpiry = (value: string) => {
    return value
      .replace(/\D/g, "")
      .slice(0, 4)
      .replace(/(\d{2})(?=\d)/, "$1 / ");
  };

  const handlePayment = () => {
    subscribeMutation.mutate(
      { plan_id: planId },
      {
        onSuccess: (subscriptionResponse) => {
          const subscriptionId = subscriptionResponse.id;

          initiatePaymentMutation.mutate(
            {
              subscription_id: subscriptionId,
              payment_method: paymentMethod,
              phone_number:
                paymentMethod === PaymentMethod.MOBILE_MONEY
                  ? phoneNumber.trim() || null
                  : null,
            },
            {
              onSuccess: (paymentData) => {
                if (paymentData.redirect_url) {
                  window.location.href = paymentData.redirect_url;
                } else {
                  router.push("/payment/callback?status=pending");
                }
              },
            }
          );
        },
      }
    );
  };

  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(plan.price);

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold text-center mb-10">
        Finaliser votre souscription
      </h1>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Résumé du plan */}
        <Card>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-4xl font-bold">{formattedPrice}</div>
            <Separator />
            <div className="space-y-3">
              {plan.features &&
                Object.entries(plan.features)
                  .filter(([_, enabled]) => enabled === true)
                  .map(([feature]) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-600 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de paiement */}
        <Card>
          <CardHeader>
            <CardTitle>Méthode de paiement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition">
                <RadioGroupItem
                  value={PaymentMethod.MOBILE_MONEY}
                  id="mobile"
                />
                <Label
                  htmlFor="mobile"
                  className="flex-1 cursor-pointer font-medium"
                >
                  Mobile Money{" "}
                  <span className="font-normal text-muted-foreground">
                    (Orange, MTN, Wave...)
                  </span>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition">
                <RadioGroupItem value={PaymentMethod.CARD} id="card" />
                <Label
                  htmlFor="card"
                  className="flex-1 cursor-pointer font-medium"
                >
                  Carte bancaire
                </Label>
              </div>
            </RadioGroup>

            {/* Mobile Money */}
            {paymentMethod === PaymentMethod.MOBILE_MONEY && (
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ex: 690000000"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 12)
                    )
                  }
                  maxLength={12}
                />
                <p className="text-xs text-muted-foreground">
                  Sans indicatif, commencez par 6 ou 9
                </p>
              </div>
            )}

            {/* Carte bancaire */}
            {paymentMethod === PaymentMethod.CARD && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Numéro de carte</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formatCardNumber(cardNumber)}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiration (MM/AA)</Label>
                    <Input
                      id="expiry"
                      placeholder="MM / AA"
                      value={formatExpiry(cardExpiry)}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={7}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) =>
                        setCardCvc(
                          e.target.value.replace(/\D/g, "").slice(0, 4)
                        )
                      }
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardHolder">Titulaire de la carte</Label>
                  <Input
                    id="cardHolder"
                    placeholder="Jean Dupont"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total à payer</span>
              <span>{formattedPrice}</span>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handlePayment}
              disabled={isProcessing || !isFormValid}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                "Payer maintenant"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
