<template>
  <section class="section section--white">
    <div class="container--narrow">

      <!-- Header -->
      <div class="section-header">
        <Tag value="FAQ" severity="success" />
        <h2 class="section-title">Questions fréquentes</h2>
        <p class="section-subtitle">
          Tout ce que vous devez savoir avant de commencer votre préparation.
        </p>
      </div>

      <!-- Accordion -->
      <Accordion class="faq__accordion">
        <AccordionPanel
          v-for="item in faqs"
          :key="item.q"
          :value="item.q"
        >
          <AccordionHeader class="faq__header">
            {{ item.q }}
          </AccordionHeader>
          <AccordionContent>
            <p class="faq__answer">{{ item.a }}</p>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>

      <!-- CTA contact -->
      <div class="faq__contact">
        <p>Vous ne trouvez pas de réponse à votre question ?</p>
        <NuxtLink to="/contact">
          <Button
            label="Contactez-nous"
            icon="pi pi-envelope"
            outlined
            class="faq__contact-btn"
          />
        </NuxtLink>
      </div>

    </div>
  </section>
</template>

<script setup>
const faqs = [
  {
    q: 'Les tests sont-ils similaires à l\'examen réel ?',
    a: 'Oui, nos tests reproduisent exactement les conditions du TCF Canada officiel : même format, même durée, même niveau de difficulté. Vous serez dans les meilleures conditions le jour J.',
  },
  {
    q: 'Combien de temps faut-il pour se préparer au TCF Canada ?',
    a: 'Cela dépend de votre niveau de départ et de l\'objectif NCLC visé. En général, 3 à 6 semaines de préparation intensive suffisent pour progresser de 1 à 2 niveaux NCLC.',
  },
  {
    q: 'Le simulateur IA corrige-t-il vraiment bien ?',
    a: 'Notre simulateur est basé sur les critères officiels d\'évaluation du TCF Canada. Il analyse la structure, le vocabulaire, la grammaire et la pertinence de vos productions en quelques secondes.',
  },
  {
    q: 'Puis-je accéder à la plateforme depuis mon téléphone ?',
    a: 'Absolument. Lumina est entièrement responsive et optimisée pour mobile, tablette et ordinateur. Révisez où que vous soyez, quand vous le souhaitez.',
  },
  {
    q: 'Y a-t-il un accès gratuit ?',
    a: 'Oui, vous pouvez découvrir l\'interface et utiliser le calculateur NCLC sans créer de compte. L\'accès complet aux tests et aux corrections IA nécessite un abonnement.',
  },
  {
    q: 'Comment fonctionne le paiement ?',
    a: 'Le paiement est sécurisé via Mobile Money (Orange Money, MTN MoMo) et carte bancaire. L\'accès est activé immédiatement après confirmation du paiement.',
  },
]
</script>

<style scoped>
/* ── Accordion ─────────────────────────────────────────────── */
.faq__accordion {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

:deep(.p-accordionpanel) {
  border: 1px solid var(--border-color) !important;
  border-radius: 0.875rem !important;
  overflow: hidden;
}

:deep(.p-accordionheader) {
  background: var(--bg-card) !important;
  border: none !important;
  padding: 1.125rem 1.25rem !important;
}

:deep(.p-accordionheader-toggle-icon) {
  color: var(--color-primary-600) !important;
}

:deep(.p-accordionheader:hover) {
  background: var(--bg-hover) !important;
}

:deep(.p-accordioncontent-content) {
  background: var(--bg-card) !important;
  border-top: 1px solid var(--border-color) !important;
  padding: 1rem 1.25rem !important;
}

.faq__header {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.faq__answer {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.75;
  margin: 0;
}

/* ── CTA contact ───────────────────────────────────────────── */
.faq__contact {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2.5rem;
  padding: 2rem;
  background: var(--bg-ground);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  text-align: center;
}

.faq__contact p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
}

.faq__contact-btn {
  border-color: var(--color-primary-600) !important;
  color: var(--color-primary-600) !important;
  border-radius: 0.625rem !important;
  font-weight: 600 !important;
}
</style>