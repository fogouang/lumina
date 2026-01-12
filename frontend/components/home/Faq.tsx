"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Comment fonctionne la correction IA?",
      answer:
        "Notre IA analyse votre texte en 10 secondes et vous donne un score détaillé sur la grammaire, le vocabulaire, la syntaxe et la cohérence. Elle est entraînée sur 10,000+ copies TCF réelles pour garantir la fiabilité des corrections.",
    },
    {
      question: "Quelle est la différence entre correction IA et humaine?",
      answer:
        "La correction IA est instantanée et illimitée - parfaite pour identifier vos erreurs de grammaire et vocabulaire. La correction humaine valide votre méthodologie, structure d'argumentation et vous donne des conseils personnalisés pour maximiser votre score. Nous recommandons: IA pour la pratique quotidienne, humain pour la validation finale.",
    },
    {
      question: "Les séries sont-elles conformes au TCF Canada 2025?",
      answer:
        "Oui, toutes nos séries respectent strictement le format officiel TCF Canada 2025: mêmes types de questions, même durée, mêmes consignes. Nous mettons à jour régulièrement notre contenu selon les évolutions de l'examen.",
    },
    {
      question: "Combien de temps pour atteindre C1/C2?",
      answer:
        "Cela dépend de votre niveau de départ. En moyenne, nos utilisateurs progressent d'un niveau CECRL en 4-6 semaines avec une pratique régulière (3-4 séries par semaine). Si vous êtes déjà B2, vous pouvez viser C1 en 1-2 mois.",
    },
    {
      question: "Puis-je utiliser la plateforme sur mobile?",
      answer:
        "Oui, notre plateforme est 100% responsive. Vous pouvez pratiquer sur smartphone, tablette ou ordinateur. L'enregistrement audio pour l'expression orale fonctionne parfaitement sur mobile.",
    },
    {
      question: "Comment se passe l'activation après paiement?",
      answer:
        "L'activation est immédiate et automatique. Après paiement (Mobile Money, carte bancaire ou virement), vous recevez un email de confirmation et vous pouvez accéder instantanément à toutes les séries incluses dans votre plan.",
    },
    {
      question: "Y a-t-il une garantie satisfait ou remboursé?",
      answer:
        "Oui, nous offrons une garantie 7 jours satisfait ou remboursé. Si vous n'êtes pas satisfait de la plateforme pour quelque raison que ce soit, contactez-nous dans les 7 premiers jours pour un remboursement intégral.",
    },
    {
      question: "Puis-je annuler mon abonnement à tout moment?",
      answer:
        "Oui, vous pouvez annuler votre abonnement en 1 clic depuis votre espace personnel. Aucune pénalité, aucune question posée. Vous gardez accès jusqu'à la fin de votre période payée.",
    },
  ];

  return (
    <section className="lg:py-16  from-emerald-50 to-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-4">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Questions fréquentes
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Tout ce que vous devez savoir sur Lumina TCF
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-slate-200 dark:border-slate-800 rounded-lg px-6 bg-white dark:bg-slate-800/50"
            >
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <span className="text-base font-semibold text-slate-900 dark:text-white pr-4">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6  text-slate-600 dark:text-slate-400 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA Footer */}
        <div className="mt-12 mb-8 text-center p-8 bg-linear-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Vous avez d'autres questions?
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Notre équipe est là pour vous aider
          </p>

          <a
            href="mailto:support@luminatcf.com"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            Contactez-nous
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
