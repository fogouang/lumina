// components/platform/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { isAuthenticated, isHydrated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <img
              src="/icon.png"
              alt="logo image"
              className="h-9 md:h-12 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              Accueil
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              À propos
            </Link>
            <Link href="/plans" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              Abonnements
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-emerald-600 transition-colors">
              Contact
            </Link>

            {/* ✅ Afficher les boutons seulement quand hydraté */}
            {isHydrated && (
              <>
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" className="text-sm font-medium hover:text-emerald-600 transition-colors">
                      Tableau de bord
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => logout()}
                      className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                        Connexion
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        S'inscrire gratuitement
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu - même logique */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-86 sm:w-100">
              <div className="flex flex-col space-y-6 m-8">
                <Link href="/" onClick={() => setIsOpen(false)}>Accueil</Link>
                <Link href="/about" onClick={() => setIsOpen(false)}>À propos</Link>
                <Link href="/plans" onClick={() => setIsOpen(false)}>Formules</Link>
                <Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>

                {/* ✅ Pareil pour mobile */}
                {isHydrated && (
                  <>
                    {isAuthenticated ? (
                      <>
                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>Tableau de bord</Link>
                        <Button variant="destructive" onClick={() => { logout(); setIsOpen(false); }}>
                          Déconnexion
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-auto border-emerald-600 text-emerald-600">
                            Connexion
                          </Button>
                        </Link>
                        <Link href="/register" onClick={() => setIsOpen(false)}>
                          <Button className="w-auto bg-emerald-600 hover:bg-emerald-700">
                            S'inscrire gratuitement
                          </Button>
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}