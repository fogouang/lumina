"use client";
import { Mail, PhoneCall } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Condition() {
  return (
    <div className="relative py-16 lg:py-24 overflow-hidden dark:from-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-50 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Conditions Générales d'Utilisation
              <br />
              <span className="text-emerald-600 dark:text-emerald-400">
                et de Vente
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Plateforme{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Lumina
              </span>
            </p>
          </div>

          {/* Content */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {/* Section 1 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    1. Objet
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Les présentes Conditions Générales régissent l'accès et
                    l'utilisation de la plateforme{" "}
                    <span className="text-emerald-400">Lumina</span> , ainsi que
                    les modalités de souscription aux services proposés. Toute
                    utilisation du Service implique l'acceptation sans réserve
                    des présentes conditions.
                  </p>
                </section>

                {/* Section 2 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    2. Définitions
                  </h2>
                  <div className="space-y-3">
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Plateforme / Société :
                      </span>{" "}
                      <span className="text-emerald-400">Lumina</span>{" "}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Service :
                      </span>{" "}
                      plateforme de formation en ligne accessible via le site
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Utilisateur :
                      </span>{" "}
                      toute personne accédant au Service
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Abonnement :
                      </span>{" "}
                      accès payant aux contenus et fonctionnalités
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Contenus :
                      </span>{" "}
                      cours, vidéos, exercices, supports pédagogiques
                    </p>
                  </div>
                </section>

                {/* Section 3 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    3. Accès au service
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    L'accès au Service est réservé aux utilisateurs disposant
                    d'un compte personnel. L'utilisateur s'engage à fournir des
                    informations exactes et à maintenir la confidentialité de
                    ses identifiants.
                  </p>
                </section>

                {/* Section 4 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    4. Conditions d'inscription
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>
                      L'inscription est ouverte aux personnes âgées d'au moins
                      16 ans
                    </li>
                    <li>Un seul compte par utilisateur est autorisé</li>
                    <li>Le partage de compte est strictement interdit</li>
                  </ul>
                </section>

                {/* Section 5 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    5. Description des services
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">
                    La plateforme propose des contenus pédagogiques numériques
                    accessibles :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>Via une version gratuite (si applicable)</li>
                    <li>
                      Via des abonnements payants donnant accès à des contenus
                      premium
                    </li>
                  </ul>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                    Les contenus sont fournis à titre pédagogique et peuvent
                    évoluer.
                  </p>
                </section>

                {/* Section 6 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    6. Abonnements et paiements
                  </h2>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>
                      Les abonnements sont facturés selon les tarifs affichés
                    </li>
                    <li>Le paiement est exigible à la souscription</li>
                    <li>
                      Les moyens de paiement acceptés sont indiqués sur la
                      plateforme
                    </li>
                    <li>Toute souscription donne accès immédiat au Service</li>
                  </ul>
                </section>

                {/* Section 7 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    7. Droit de rétractation et remboursement
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Les conditions de rétractation et de remboursement sont
                    définies dans une page dédiée :{" "}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Politique de remboursement et d'annulation
                    </span>
                    .
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    En validant le paiement, l'utilisateur reconnaît que
                    l'exécution du service commence immédiatement.
                  </p>
                </section>

                {/* Section 8 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    8. Utilisation autorisée
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">
                    L'utilisateur s'engage à :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>
                      Utiliser le Service à des fins personnelles et légales
                    </li>
                    <li>Ne pas copier, revendre ou diffuser les contenus</li>
                    <li>
                      Respecter les règles de bonne conduite sur la plateforme
                    </li>
                  </ul>
                </section>

                {/* Section 9 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    9. Interdictions
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">
                    Il est strictement interdit :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>De partager ou vendre l'accès à son compte</li>
                    <li>De tenter de contourner les systèmes de sécurité</li>
                    <li>D'utiliser le Service à des fins frauduleuses</li>
                    <li>
                      De porter atteinte aux droits de la plateforme ou des
                      autres utilisateurs
                    </li>
                  </ul>
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded">
                    <p className="text-amber-800 dark:text-amber-300 font-medium">
                      ⚠️ Toute violation peut entraîner la suspension ou la
                      suppression du compte, sans remboursement.
                    </p>
                  </div>
                </section>

                {/* Section 10 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    10. Propriété intellectuelle
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    L'ensemble des contenus présents sur la plateforme est
                    protégé par les lois relatives à la propriété
                    intellectuelle. Toute reproduction ou exploitation non
                    autorisée est interdite.
                  </p>
                </section>

                {/* Section 11 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    11. Responsabilité
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    La plateforme s'efforce d'assurer un accès continu au
                    Service, mais ne garantit pas l'absence d'interruptions ou
                    d'erreurs. La responsabilité de la Société ne saurait être
                    engagée en cas de :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>Panne technique</li>
                    <li>Force majeure</li>
                    <li>Mauvaise utilisation du Service par l'utilisateur</li>
                  </ul>
                </section>

                {/* Section 12 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    12. Données personnelles
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Les données personnelles sont traitées conformément à la
                    Politique de confidentialité disponible sur le site.
                  </p>
                </section>

                {/* Section 13 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    13. Suspension et résiliation
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">
                    La Société se réserve le droit de suspendre ou résilier un
                    compte :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>En cas de non-respect des présentes conditions</li>
                    <li>En cas d'activité frauduleuse</li>
                    <li>Sans préavis si nécessaire</li>
                  </ul>
                </section>

                {/* Section 14 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    14. Modification des conditions
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    La Société peut modifier les présentes Conditions à tout
                    moment. Les nouvelles versions s'appliquent dès leur
                    publication sur le site.
                  </p>
                </section>

                {/* Section 15 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    15. Droit applicable et juridiction
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Les présentes Conditions sont régies par le droit
                    camerounais. En cas de litige, une solution amiable sera
                    recherchée avant toute action judiciaire.
                  </p>
                </section>

                {/* Contact Section */}
                <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    16. Contact
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Pour toute question relative aux présentes Conditions, vous
                    pouvez nous contacter :
                  </p>
                  <div className="flex gap-2">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href="mailto:contact@exemple.com"
                        className="flex items-center gap-3 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                        <span className="font-medium">
                          contact@luminatcf.com
                        </span>
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href="+237 691 85 09 13"
                        className="flex items-center gap-3 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                      >
                        <PhoneCall className="w-5 h-5" />
                        <span className="font-medium">+237 691 85 09 13</span>
                      </a>
                    </div>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
