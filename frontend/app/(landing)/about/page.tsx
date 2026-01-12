// app/about/page.tsx
import React from "react";
import {
  CheckCircle2,
  Zap,
  Brain,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getSEOTags } from "@/lib/seo";

export const metadata = getSEOTags({
  title: "À propos - Lumina TCF | Notre Mission",
  description: "Découvrez Lumina TCF, la plateforme de préparation au TCF Canada développée par ITIA Solutions. Notre mission : vous accompagner vers la réussite avec des outils innovants et une correction IA de pointe.",
  canonicalUrlRelative: "/about",
  keywords: ["Lumina TCF", "ITIA Solutions", "préparation TCF Canada", "innovation éducation"],
});

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-linear-to-b from-emerald-50/10 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Grille de fond */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-50"></div>

      <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Preparez le  TCF Canada avec{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              correction IA instantanée
            </span>{" "}
            et simulation orale en temps réel
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Entraînez-vous comme si vous passiez le vrai examen. Maintenant.
          </p>
        </div>

        {/* Le Problème */}
        <section className="max-w-4xl mx-auto mb-20">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 border-l-4 border-red-500">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Le problème avec la préparation TCF traditionnelle
            </h2>
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              Attendre <strong>3-7 jours</strong> pour une correction écrite.
              Payer <strong>30 000 Fcfa</strong> pour 15 minutes d'oral avec un
              professeur. Ne jamais savoir si votre prononciation est correcte.{" "}
              <span className="text-red-600 dark:text-red-400 font-semibold">
                Résultat : vous passez l'examen en aveugle et vous échouez.
              </span>
            </p>
          </div>
        </section>

        {/* Notre Solution */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Comment Lumina TCF résout ce problème
          </h2>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Correction IA Expression Écrite */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Correction IA Expression Écrite
                  </h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Analyse grammaticale en <strong>3 secondes</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Détection: conjugaison, accords, syntaxe, ponctuation
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Score vocabulaire (richesse, répétitions, registre)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Estimation score CECRL (A2 → C2)
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                    🚀 Votre gain
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-400 mt-1">
                    Feedback immédiat • Itérations illimitées • Économisez vos
                    crédits
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Simulation Expression Orale */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Simulation Orale Temps Réel
                  </h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Enregistrement avec chronomètre officiel TCF
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Timer préparation + réponse (conditions réelles)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Playback pour auto-évaluation
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Limite écoute consigne (2x max, comme l'examen)
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-blue-200 dark:border-emerald-800">
                  <p className="text-sm font-semibold text-emerald-900 dark:text-blue-300">
                    🚀 Votre gain
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-400 mt-1">
                    Conditions EXACTES • Entraînement 24/7 • Pas de RDV
                    professeur
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tableau de Bord */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Progression Intelligente
                  </h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Graphique progression par compétence
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Identification automatique points faibles
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Recommandations séries prioritaires
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Estimation score TCF final
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                    Votre gain
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-400 mt-1">
                    Savoir où vous en êtes • Plan d'action personnalisé •
                    Progrès 3x plus rapides
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Validation Humaine */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Validation Humaine Stratégique
                  </h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Correcteur certifié TCF
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Feedback méthodologie et argumentation
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Tips pour maximiser votre score
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500 dark:text-yellow-400 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Correction sous 24h maximum
                    </span>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">
                    🚀 Votre gain
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-400 mt-1">
                    Meilleur des 2 mondes • Budget optimisé • Expertise humaine
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Comparaison Avant/Après */}
        <section className="mb-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Avant / Après
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900">
                  <th className="px-6 py-4 text-left text-slate-700 dark:text-slate-300 font-semibold">
                    Méthode Traditionnelle
                  </th>
                  <th className="px-6 py-4 text-left text-emerald-700 dark:text-emerald-400 font-semibold">
                    Avec Lumina TCF
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <tr>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    Correction en 5-7 jours
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                    IA instantanée + Humain 24h
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    50€ par correction orale
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                    Simulations illimitées
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    Pas de feedback structuré
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                    Dashboard détaillé
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    Vous ne savez pas votre niveau
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                    Score CECRL en temps réel
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    Conditions différentes de l'examen
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                    Simulation exacte TCF
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="max-w-2xl mx-auto text-center bg-emerald-600  rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Testez la différence</h2>
          <p className="text-lg mb-8 text-emerald-50">
            Essayez une série complète avec correction IA instantanée.
            <br />
            Gratuit, sans carte bancaire.
          </p>

          <a
            href="/register"
            className="inline-block px-8 py-4 bg-white text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Démarrer l'essai gratuit
          </a>
        </section>

        {/* CTA Final */}
      </div>
    </div>
  );
}
