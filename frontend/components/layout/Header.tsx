"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import NotificationBell from "./NotificationBell";
import MobileNav from "./MobileNav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { useLogout } from "@/hooks/mutations/useAuthMutations";

export default function Header() {
  const { user, isAuthenticated, isHydrated } = useAuth();
  const { mutate: logout } = useLogout();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "?";
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className=" flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          {/* Mobile Menu */}
          {isAuthenticated && (
            <div className="lg:hidden">
              <MobileNav />
            </div>
          )}

          {/* Logo */}
          <Link
            href={isAuthenticated ? ROUTES.STUDENT_DASHBOARD : ROUTES.HOME}
            className=" flex items-center"
          >
            <img
              src="/icon.png"
              alt="logo image"
              className="hidden md:block h-9 md:h-12 object-contain"
            />
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {!isHydrated ? (
            // Pendant l'hydratation, afficher un espace vide pour éviter le flash
            <div className="w-24 h-10" />
          ) : isAuthenticated ? (
            <>
              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user?.first_name, user?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={ROUTES.STUDENT_SETTINGS}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={ROUTES.STUDENT_SETTINGS}
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href={ROUTES.LOGIN}>Connexion</Link>
              </Button>
              <Button asChild>
                <Link href={ROUTES.REGISTER}>S'inscrire</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
