<script setup lang="ts">
import { site } from "~/config/site";

const faqs = [
  {
    q: "Les tests sont-ils similaires à l'examen réel ?",
    a: "Oui, nos tests reproduisent exactement les conditions du TCF Canada officiel : même format, même durée, même niveau de difficulté. Vous serez dans les meilleures conditions le jour J.",
  },
  {
    q: "Combien de temps faut-il pour se préparer au TCF Canada ?",
    a: "Cela dépend de votre niveau de départ et de l'objectif NCLC visé. En général, 3 à 6 semaines de préparation intensive suffisent pour progresser de 1 à 2 niveaux NCLC.",
  },
  {
    q: "Le simulateur IA corrige-t-il vraiment bien ?",
    a: "Notre simulateur est basé sur les critères officiels d'évaluation du TCF Canada. Il analyse la structure, le vocabulaire, la grammaire et la pertinence de vos productions en quelques secondes.",
  },
  {
    q: "Puis-je accéder à la plateforme depuis mon téléphone ?",
    a: `Absolument. ${site.name} est entièrement responsive et optimisée pour mobile, tablette et ordinateur. Révisez où que vous soyez, quand vous le souhaitez.`,
  },
  {
    q: "Y a-t-il un accès gratuit ?",
    a: "Oui, vous pouvez découvrir l'interface et utiliser le calculateur NCLC sans créer de compte. L'accès complet aux tests et aux corrections IA nécessite un abonnement.",
  },
  {
    q: "Comment fonctionne le paiement ?",
    a: "Le paiement est sécurisé via Mobile Money (Orange Money, MTN MoMo) et carte bancaire. L'accès est activé immédiatement après confirmation du paiement.",
  },
];
</script>

<template>
  <section class="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
    <div class="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      <!-- Colonne gauche : titre + contact -->
      <div class="lg:sticky lg:top-28 lg:self-start">
        <SectionHeading
          align="left"
          eyebrow="FAQ"
          title="Questions fréquentes"
          subtitle="Tout ce que vous devez savoir avant de commencer votre préparation."
        />

        <div v-reveal="{ delay: 240 }" class="mt-10">
          <div class="featured-panel rounded-[2rem_0.5rem] p-7 text-white shadow-brand">
            <span class="grid size-11 place-items-center rounded-[0.95rem_0.3rem] bg-accent-400 text-accent-950">
              <i class="pi pi-envelope" />
            </span>
            <p class="mt-5 font-heading text-lg font-bold">Vous ne trouvez pas votre réponse ?</p>
            <p class="mt-1 text-sm text-white/80">Notre équipe vous répond rapidement.</p>
            <AppCta
              to="/contact"
              label="Contactez-nous"
              icon="pi pi-arrow-right"
              variant="light"
              size="md"
              class="mt-6"
            />
          </div>
        </div>
      </div>

      <!-- Colonne droite : accordéon -->
      <div v-reveal="{ delay: 150 }">
        <Accordion value="0" class="flex flex-col gap-3">
          <AccordionPanel
            v-for="(item, i) in faqs"
            :key="item.q"
            :value="String(i)"
            class="overflow-hidden rounded-card border border-line bg-card shadow-soft transition-all duration-300 ease-spring [&.p-accordionpanel-active]:border-primary-200 [&.p-accordionpanel-active]:shadow-lift dark:[&.p-accordionpanel-active]:border-primary-800"
          >
            <AccordionHeader
              class="bg-card px-6 py-5 text-left font-heading text-[0.9375rem] font-semibold text-ink hover:bg-card-2 [&_.p-accordionheader-toggle-icon]:text-primary"
            >
              {{ item.q }}
            </AccordionHeader>
            <AccordionContent>
              <p class="border-t border-line px-6 py-5 text-[0.9375rem] leading-relaxed text-muted">
                {{ item.a }}
              </p>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>
    </div>
  </section>
</template>