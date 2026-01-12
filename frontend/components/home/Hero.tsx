"use client";

import React from "react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-linear-to-b from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Grille de fond */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Colonne gauche - Contenu */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-6">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sujet constament Mise à jour
            </div>

            {/* Titre */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Obtenez votre{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                C1/C2
              </span>{" "}
              au TCF Canada
            </h1>

            {/* Sous-titre */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Correction IA instantanée pour vos écrits. Simulateur en
              conditions réelles pour l'oral. Progression garantie.
            </p>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Test diagnostic gratuit (20min)
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-4 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-semibold rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-500 transition-all duration-200"
              >
                Voir les tarifs
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  200+
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Candidats préparés
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  40+
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Séries complet
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  24h
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Correction maximale pour correction manuelle
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Visuel */}
          <div className="relative hidden lg:block">
            {/* Carte de simulation d'examen */}
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Expression Écrite
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Les trois tâches
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-full">
                  IA
                </span>
              </div>

              {/* Critères de correction */}
              <div className="space-y-3 mb-6 grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        A
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Structure et organisation globale
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    3/5
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        B
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Cohésion et Cohérence
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    3/4
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        C
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Richesse lexicale
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    3/4
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        D
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Grammaire et Orthographe
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    3/3
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        E
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Pertinence et realisation des tâches
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    4/4
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      Correction en 10 secondes
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-emerald-600 text-white rounded-full font-semibold">
                    INSTANTANÉ
                  </span>
                </div>
              </div>

              {/* Score estimé */}
              <div className="bg-linear-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-4 rounded-lg mb-4">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Estimation niveau CECRL
                </div>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  C1
                </div>
              </div>

              {/* CTA */}
              <button className="w-full py-3 bg-emerald-600 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-lg hover:bg-emerald-700 cursor-pointer dark:hover:bg-slate-100 transition-colors">
                Essayer maintenant
              </button>
            </div>

            {/* Badge flottant */}
            <div className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Sans carte bancaire
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
