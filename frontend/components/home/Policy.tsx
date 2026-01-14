"use client";
import { Mail, Phone, MapPin, Send, PhoneCall } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function Condition() {
  return (
    <div className="relative py-16 lg:py-24 overflow-hidden  dark:from-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-50 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              <span className="text-emerald-600 dark:text-emerald-400">
                Politique de confidentialité
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Dernière mise à jour : Janvier 2026
            </p>
          </div>

          {/* Content */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {/* Section 1 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    1. Introduction
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    La présente Politique de confidentialité décrit la manière
                    dont notre <span className="text-emerald-400">Lumina</span>{" "}
                    collecte, utilise, protège et traite les données
                    personnelles des utilisateurs lorsqu'ils accèdent à notre
                    plateforme de formation en ligne. En utilisant notre site et
                    nos services, vous acceptez les pratiques décrites dans la
                    présente politique.
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
                      désigne <span className="text-emerald-400">Lumina</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Service :
                      </span>{" "}
                      désigne <span className="text-emerald-400">Lumina</span>{" "}
                      accessible via le site web.
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Utilisateur :
                      </span>{" "}
                      désigne toute personne accédant ou utilisant le Service.
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Données personnelles :
                      </span>{" "}
                      toute information permettant d'identifier directement ou
                      indirectement un utilisateur.
                    </p>
                  </div>
                </section>

                {/* Section 3 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    3. Données collectées
                  </h2>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    3.1 Données fournies par l'utilisateur
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">
                    Nous pouvons collecter les informations suivantes :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>Nom et prénom</li>
                    <li>Adresse e-mail</li>
                    <li>Numéro de téléphone</li>
                    <li>
                      Informations de connexion (identifiant, mot de passe
                      chiffré)
                    </li>
                    <li>Informations liées aux abonnements et paiements</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 mt-6">
                    3.2 Données collectées automatiquement
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>Adresse IP</li>
                    <li>Type d'appareil et de navigateur</li>
                    <li>Pages visitées</li>
                    <li>Durée des sessions</li>
                    <li>Données de navigation et de performance</li>
                  </ul>
                </section>

                {/* Section 4 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    4. Utilisation des données
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">
                    Les données collectées sont utilisées pour :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>Fournir et maintenir le Service</li>
                    <li>Gérer les comptes utilisateurs</li>
                    <li>Traiter les abonnements et paiements</li>
                    <li>Améliorer l'expérience utilisateur</li>
                    <li>Assurer la sécurité de la plateforme</li>
                    <li>Communiquer avec les utilisateurs</li>
                    <li>Respecter les obligations légales et réglementaires</li>
                  </ul>
                </section>

                {/* Section 5 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    5. Cookies et technologies similaires
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    La plateforme peut utiliser des cookies et technologies
                    similaires afin de garantir le bon fonctionnement du site,
                    analyser l'utilisation du Service et améliorer les
                    performances et le contenu.
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    L'utilisateur peut configurer son navigateur pour refuser
                    les cookies. Toutefois, certaines fonctionnalités du site
                    peuvent être limitées.
                  </p>
                </section>

                {/* Section 6 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    6. Partage des données
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">
                    Les données personnelles peuvent être partagées uniquement
                    avec :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>
                      Des prestataires techniques (hébergement, paiement,
                      emailing)
                    </li>
                    <li>
                      Des partenaires strictement nécessaires au fonctionnement
                      du Service
                    </li>
                    <li>Les autorités compétentes lorsque la loi l'exige</li>
                  </ul>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-3 font-semibold">
                    Aucune donnée personnelle n'est vendue à des tiers.
                  </p>
                </section>

                {/* Section 7 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    7. Conservation des données
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Les données personnelles sont conservées uniquement pendant
                    la durée nécessaire à la fourniture du Service, au respect
                    des obligations légales et à la gestion des relations
                    contractuelles.
                  </p>
                </section>

                {/* Section 8 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    8. Sécurité des données
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Nous mettons en œuvre des mesures techniques et
                    organisationnelles raisonnables afin de protéger les données
                    personnelles contre l'accès non autorisé, la perte,
                    l'altération ou la divulgation. Cependant, aucun système de
                    transmission ou de stockage électronique n'est totalement
                    sécurisé.
                  </p>
                </section>

                {/* Section 9 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    9. Droits des utilisateurs
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">
                    Conformément à la législation applicable, l'utilisateur
                    dispose notamment des droits suivants :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-4">
                    <li>Droit d'accès à ses données</li>
                    <li>Droit de rectification</li>
                    <li>Droit de suppression</li>
                    <li>Droit d'opposition ou de limitation du traitement</li>
                  </ul>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                    Toute demande peut être adressée via les coordonnées
                    indiquées ci-dessous.
                  </p>
                </section>

                {/* Section 10 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    10. Confidentialité des mineurs
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Le Service n'est pas destiné aux personnes âgées de moins de
                    16 ans. Nous ne collectons pas sciemment de données
                    personnelles concernant des mineurs.
                  </p>
                </section>

                {/* Section 11 */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    11. Modification de la politique
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Nous nous réservons le droit de modifier la présente
                    Politique de confidentialité à tout moment. Les
                    modifications prennent effet dès leur publication sur le
                    site. La date de mise à jour sera indiquée en haut de la
                    page.
                  </p>
                </section>

                {/* Contact Section */}
                <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    12. Contact
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Pour toute question relative à cette Politique de
                    confidentialité ou à vos données personnelles, vous pouvez
                    nous contacter :
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
