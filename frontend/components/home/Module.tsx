"use client";
import { Book, Pen, Headset, Mic, UsersIcon, Workflow } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, type Variants } from "motion/react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function ModuleTcf() {
  return (
    <div className="relative py-4 lg:py-8 overflow-hidden  dark:from-slate-900 dark:to-slate-800">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
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
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-4"
          >
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow h-full">
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
                        Textes authentiques et questions ciblées pour apprendre
                        à lire vite, comprendre l'essentiel et répondre avec
                        précision.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow h-full">
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
                        Audios réalistes et supports visuels pour entraîner
                        votre écoute et comprendre le français tel qu'il est
                        réellement parlé.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow h-full">
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
                        Rédactions corrigées par des experts certifiés et par
                        l'IA pour améliorer structure, vocabulaire et cohérence.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow h-full">
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
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow h-full">
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
                        l'examen.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow h-full">
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
                        communauté motivée d'apprenants comme vous.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}