import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
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
  title: "Connexion | TCF Canada",
  description: "Connectez-vous à votre compte TCF Canada",
};

export default function LoginPage() {
  return (
    <div className=" flex min-h-screen w-full items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-none shadow-lg sm:border sm:shadow-md">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-bold">
            Bienvenue sur TCF Canada
          </CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à votre espace
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <LoginForm />
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pb-6">
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
          >
            Mot de passe oublié ?
          </Link>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Nouveau sur TCF Canada ?
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href={ROUTES.REGISTER}
              className="font-semibold text-primary hover:underline"
            >
              Créer un compte gratuitement
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}