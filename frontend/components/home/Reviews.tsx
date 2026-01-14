"use client";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, type Variants } from "motion/react";

const REVIEWS = [
  {
    name: "Sarah M.",
    role: "Candidate TCF Canada",
    comment:
      "Grâce à Lumina, j’ai mieux compris la structure du TCF. Les corrections automatiques m’ont énormément aidée à progresser.",
    rating: 5,
  },
  {
    name: "David K.",
    role: "Étudiant",
    comment:
      "Les examens blancs sont très proches de l’examen réel. La méthodologie m’a permis de mieux gérer mon temps.",
    rating: 5,
  },
  {
    name: "Amina B.",
    role: "Apprenante",
    comment:
      "La plateforme est claire, intuitive et la communauté WhatsApp est vraiment motivante. Je recommande vivement.",
    rating: 4,
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const, // ← solution la plus courante et fiable
    },
  },
};

export default function Reviews() {
  return (
    <div className="relative py-4 lg:py-8 overflow-hidden dark:from-slate-900 dark:to-slate-800">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1 className="text-3xl md:text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Ils nous font{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              confiance
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Découvrez ce que pensent nos apprenants de leur expérience sur{" "}
            <span className="text-emerald-600">Lumina</span>.
          </p>
        </motion.div>

        {/* Reviews grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-4"
        >
          {REVIEWS.map((review, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Card className="border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <Quote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <div>
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-emerald-500 text-emerald-500"
                          />
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-slate-600 dark:text-slate-300 mb-3">
                        “{review.comment}”
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
    </div>
  );
}
