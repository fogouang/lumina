import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Brain,
  Zap,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-secondary/10 rounded-full translate-x-24 translate-y-24"></div>
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-primary/5 rounded-full -translate-x-16 -translate-y-16"></div>

      {/* Overlay subtil */}
      <div className="absolute inset-0 bg-linear-to-t from-gray-900/50 to-transparent"></div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center">
              <div className="flex items-center">
                {/* Logo Lumina avec icône */}
                <div className="w-10 h-10 mr-3 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    <div className="absolute w-1 h-4 bg-primary rounded-full transform rotate-45 origin-bottom"></div>
                    <div className="absolute w-1 h-4 bg-primary rounded-full transform -rotate-45 origin-bottom"></div>
                    <div className="absolute w-1 h-3 bg-primary rounded-full transform rotate-90"></div>
                    <div className="absolute w-1 h-3 bg-primary rounded-full transform -rotate-90"></div>
                  </div>
                </div>
                <span className="text-2xl font-bold text-white">Lumina</span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-gray-300 leading-relaxed">
              Révolutionnez votre apprentissage du français avec l'intelligence
              artificielle.
              <span className="text-primary font-medium">
                {" "}
                Data. Illuminated.
              </span>
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors duration-300"
              >
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-secondary transition-colors duration-300"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors duration-300"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-secondary transition-colors duration-300"
              >
                <span className="sr-only">YouTube</span>
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Plateforme */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center">
              <Brain className="h-4 w-4 text-primary mr-2" />
              Plateforme IA
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  À propos de Lumina
                </Link>
              </li>
              <li>
                <Link
                  href="/technology"
                  className="text-sm text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  Notre technologie
                </Link>
              </li>
              <li>
                <Link
                  href="/tcf-ai"
                  className="text-sm text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  TCF avec IA
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  Abonnements
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  Blog Tech
                </Link>
              </li>
            </ul>
          </div>

          {/* Apprentissage */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center">
              <Zap className="h-4 w-4 text-secondary mr-2" />
              Apprentissage
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/adaptive-learning"
                  className="text-sm text-gray-300 hover:text-secondary transition-colors duration-300"
                >
                  IA Adaptive
                </Link>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="text-sm text-gray-300 hover:text-secondary transition-colors duration-300"
                >
                  Analytics & Métriques
                </Link>
              </li>
              <li>
                <Link
                  href="/personalization"
                  className="text-sm text-gray-300 hover:text-secondary transition-colors duration-300"
                >
                  Personnalisation
                </Link>
              </li>
              <li>
                <Link
                  href="/progress-tracking"
                  className="text-sm text-gray-300 hover:text-secondary transition-colors duration-300"
                >
                  Suivi Intelligent
                </Link>
              </li>
              <li>
                <Link
                  href="/success-stories"
                  className="text-sm text-gray-300 hover:text-secondary transition-colors duration-300"
                >
                  Témoignages
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/help"
                  className="text-sm text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  Centre d'aide
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link
                  href="/api-docs"
                  className="text-sm text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  Documentation API
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  Politique de confidentialité
                </Link>
              </li>
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-start">
                <Phone className="h-4 w-4 text-primary mt-0.5 mr-2 shrink-0" />
                <span className="text-sm text-gray-300">+227 694-521-346</span>
              </div>
              <div className="flex items-start">
                <Mail className="h-4 w-4 text-secondary mt-0.5 mr-2 shrink-0" />
                <span className="text-sm text-gray-300">contact@lumina.ai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section inférieure */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-sm text-gray-400">
                &copy; {currentYear} Lumina. Tous droits réservés.
              </p>
            </div>

            {/* Moyens de paiement */}
            <div className="text-center lg:text-right">
              <h4 className="text-xs font-semibold text-gray-400 mb-3">
                Moyens de paiement sécurisés
              </h4>
              <div className="flex items-center justify-center lg:justify-end space-x-3">
                <div className="h-8 w-12 bg-linear-to-r from-yellow-400 to-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  CB
                </div>
                <div className="h-8 w-12 bg-linear-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  VISA
                </div>
                <div className="h-8 w-12 bg-linear-to-r from-yellow-500 to-yellow-600 rounded flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  MTN
                </div>
                <div className="h-8 w-12 bg-linear-to-r from-orange-500 to-orange-600 rounded flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  OM
                </div>
                <div className="h-8 w-12 bg-linear-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  PP
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
