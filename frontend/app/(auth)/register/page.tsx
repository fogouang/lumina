import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Inscription | TCF Canada",
  description: "Créez votre compte TCF Canada",
};

export default function RegisterPage() {
  return (
    <div className=" flex min-h-screen w-full items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-none shadow-lg sm:border sm:shadow-md">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Commencez votre préparation au TCF Canada dès maintenant
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <RegisterForm />
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pb-6">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Vous avez déjà un compte ?
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href={ROUTES.LOGIN}
              className="font-semibold text-primary hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
