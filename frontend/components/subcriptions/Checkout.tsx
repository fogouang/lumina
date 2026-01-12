"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Apple, Mail } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold text-center mb-10">
        Finaliser votre achat
      </h1>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Colonne gauche : Résumé du produit */}
        <div className="order-2 lg:order-1">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-black text-white p-3 rounded-lg">
                  <div className="w-8 h-8" /> {/* Placeholder logo shadcn */}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Shadcraft Base Figma shadcn/ui Kit
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    — Single licence
                  </p>
                </div>
              </div>
              <CardDescription className="text-base">
                Essential shadcn/ui components and blocks for Figma. Build
                faster with a solid design foundation. Licence for a single
                editor of the Figma library file. Fast support.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold">$119</span>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Shadcraft Base Figma shadcn/ui Kit</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Getting started with our Figma UI kit</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Contact</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite : Formulaire de paiement */}
        <div className="order-1 lg:order-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Votre adresse email"
                  required
                />
              </div>

              {/* Méthodes de paiement */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 flex items-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  Card
                </Button>
                <Button
                  variant="outline"
                  disabled
                  className="flex-1 flex items-center gap-2"
                >
                  <Apple className="h-5 w-5" />
                  Apple Pay
                </Button>
                <Button
                  variant="outline"
                  disabled
                  className="flex-1 flex items-center gap-2"
                >
                  <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    G
                  </div>
                  Cash App Pay
                </Button>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <CardTitle className="text-lg">Card number</CardTitle>
                <Input placeholder="1234 1234 1234 1234" />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="MM / YY" />
                  <Input placeholder="CVC" />
                </div>
                <Input placeholder="Cardholder name" />

                <div className="flex items-center space-x-2">
                  <Checkbox id="business" />
                  <label
                    htmlFor="business"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I'm purchasing as a business
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Billing address</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Cameroon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">Cameroon</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    {/* Ajoute d'autres pays si besoin */}
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Discount code (Optional)"
                className="w-full"
              />

              <Separator />

              <div className="space-y-2">
                <Label>First name</Label>
                <Input required />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input required />
              </div>
              <div className="space-y-2">
                <Label>Your role</Label>
                <Input placeholder="Designer, Engineer, Founder etc." />
              </div>

              <Separator />

              {/* Résumé des prix */}
              <div className="space-y-2 text-lg">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">$119</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span className="font-semibold">$0</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>$119</span>
                </div>
              </div>

              <Button size="lg" className="w-full text-lg py-6">
                Pay
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                This order is processed by our online reseller{" "}
                <a href="#" className="underline">
                  Paddle
                </a>
                , who also handles order-related inquiries and returns.
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Powered by</span>
                <Badge variant="secondary">Polar</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
