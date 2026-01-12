import Link from "next/link";
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
  Heart,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-br from-gray-950 via-gray-900 to-slate-950 text-gray-300 relative overflow-hidden">
      {/* Fond décoratif subtil */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -right-20 bottom-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Colonne 1 - Logo + description */}
          <div className="md:col-span-5 lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 transition-transform duration-300 group-hover:scale-110">
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl rotate-6 opacity-20 blur-sm" />
                <div className="relative bg-linear-to-br from-emerald-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
                  <img
                    src="/icon.png"
                    alt="logo image"
                    className="h-9 md:h-12 object-contain"
                  />
                </div>
              </div>
            </Link>

            <p className="mt-5 text-gray-400 leading-relaxed">
              Révolutionnez votre préparation au TCF et au français avec un
              suivi puissant, personnalisée et intuitive.
            </p>

            <div className="mt-6 flex gap-4">
              {[
                {
                  Icon: Facebook,
                  label: "Facebook",
                  color: "hover:text-blue-400",
                },
                {
                  Icon: Twitter,
                  label: "Twitter/X",
                  color: "hover:text-sky-400",
                },
                {
                  Icon: Instagram,
                  label: "Instagram",
                  color: "hover:text-pink-400",
                },
                {
                  Icon: Youtube,
                  label: "YouTube",
                  color: "hover:text-red-400",
                },
              ].map(({ Icon, label, color }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className={`text-gray-500 ${color} transition-colors duration-300 hover:scale-110 transform`}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Plateforme IA */}
          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Brain className="h-4 w-4 text-emerald-400" />
              Plateforme
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/about", label: "À propos" },
                { href: "/contact", label: "Contact" },
                { href: "/plans", label: "Formules & Tarifs" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Apprentissage */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Zap className="h-4 w-4 text-teal-400" />
              Apprentissage
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/#", label: "Apprentissage adaptatif" },
                { href: "/#", label: "Suivi & Statistiques" },
                { href: "/#", label: "Personnalisation" },
                { href: "/#", label: "Progression intelligente" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-teal-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Support
            </h3>
            <ul className="space-y-3 text-sm mb-6">
              {[
                { href: "/help", label: "Centre d'aide" },
                { href: "/contact", label: "Nous contacter" },
                { href: "/faq", label: "FAQ" },
                { href: "/user", label: "Conditions d'utilisation" },
                { href: "/conf", label: "Confidentialité" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>+237 699 123 456</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-400" />
                <span>contact@luminatcf.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bas de page */}
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
