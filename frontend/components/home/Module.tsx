"use client";
import { Book, Pen, Headset, Mic, UsersIcon, Workflow } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function ModuleTcf() {
  return (
    <div className="relative py-4 lg:py-8 overflow-hidden  dark:from-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Les quatres modules{"      "}
              <span className="text-emerald-600 dark:text-emerald-400">
                complets
              </span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Tous les outils, exercices et stratégies indispensables pour
              réussir brillamment votre examen de{" "}
              <span className="text-emerald-600"> TCF Canada</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Book className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      Compréhension Écrite
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Textes authentiques et questions ciblées pour apprendre à
                      lire vite, comprendre l’essentiel et répondre avec
                      précision.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Headset className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      Compréhension Orale
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Audios réalistes et supports visuels pour entraîner votre
                      écoute et comprendre le français tel qu’il est réellement
                      parlé.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Pen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      Expression Écrite
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Rédactions corrigées par des experts certifiés et par l’IA
                      pour améliorer structure, vocabulaire et cohérence.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Mic className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      Expression Orale
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Enregistrez vos réponses, entraînez votre fluidité et
                      recevez des retours personnalisés pour progresser
                      rapidement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Workflow className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      Méthodologie
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Stratégies claires et efficaces pour réussir chaque
                      épreuve, gérer le temps et maximiser votre score à
                      l’examen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <UsersIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      Communauté Active via WhatsApp
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Échangez, posez vos questions et progressez avec une
                      communauté motivée d’apprenants comme vous.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
