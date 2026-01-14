"use client";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const REVIEWS = [
  {
    name: "Sarah M.",
    role: "Candidate TCF Canada",
    comment:
      "Grâce à Lumina, j'ai mieux compris la structure du TCF. Les corrections automatiques m'ont énormément aidée à progresser.",
    rating: 5,
  },
  {
    name: "David K.",
    role: "Étudiant",
    comment:
      "Les examens blancs sont très proches de l'examen réel. La méthodologie m'a permis de mieux gérer mon temps.",
    rating: 5,
  },
  {
    name: "Amina B.",
    role: "Apprenante",
    comment:
      "La plateforme est claire, intuitive et la communauté WhatsApp est vraiment motivante. Je recommande vivement.",
    rating: 4,
  },
  {
    name: "Marie L.",
    role: "Professionnelle",
    comment:
      "Interface moderne et exercices pertinents. J'ai progressé rapidement en compréhension orale.",
    rating: 5,
  },
  {
    name: "Ahmed T.",
    role: "Candidat TCF",
    comment:
      "Les simulations d'examens sont excellentes. Je me sens beaucoup plus confiant pour le vrai test.",
    rating: 5,
  },
  {
    name: "Sophie D.",
    role: "Étudiante",
    comment:
      "Super plateforme ! Les explications sont claires et le suivi personnalisé est vraiment utile.",
    rating: 4,
  },
];

export default function Reviews() {
  const [isPaused, setIsPaused] = useState(false);

  // Dupliquer les reviews pour un scroll infini fluide
  const duplicatedReviews = [...REVIEWS, ...REVIEWS];

  return (
    <div className="relative py-8 lg:py-16 overflow-hidden bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Ils nous font{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              confiance
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Découvrez ce que pensent nos apprenants de leur expérience sur{" "}
            <span className="text-emerald-600 font-semibold">Lumina</span>.
          </p>
        </motion.div>

        {/* Infinite Scroll Container */}
        <div className="relative">
          {/* Gradient overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none" />

          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <motion.div
              className="flex gap-6"
              animate={{
                x: [0, -100 * REVIEWS.length],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: REVIEWS.length * 8, // 8 secondes par carte
                  ease: "linear",
                },
              }}
              style={{
                width: `${duplicatedReviews.length * 400}px`,
              }}
              {...(isPaused && { animate: { x: undefined } })}
            >
              {duplicatedReviews.map((review, index) => (
                <motion.div
                  key={index}
                  className="shrink-0 w-95"
                  whileHover={{ scale: 1.05, y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all h-full bg-white dark:bg-slate-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center shrink-0">
                          <Quote className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>

                        <div className="flex-1">
                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-3">
                            {Array.from({ length: review.rating }).map(
                              (_, i) => (
                                <Star
                                  key={i}
                                  className="w-4 h-4 fill-emerald-500 text-emerald-500"
                                />
                              )
                            )}
                          </div>

                          {/* Comment */}
                          <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                            "{review.comment}"
                          </p>

                          {/* Author */}
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {review.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {review.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Optional: Progress indicator */}
          <div className="flex justify-center mt-8 gap-2">
            {REVIEWS.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
