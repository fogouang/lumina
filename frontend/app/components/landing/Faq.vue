<template>
  <section class="section bg-(--bg-section) py-20">
    <div class="container--narrow">
      <!-- Header -->
      <div
        ref="headerRef"
        class="mx-auto max-w-2xl text-center transition-all duration-700"
        :class="
          headerVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6'
        "
      >
        <Tag value="FAQ" severity="success" class="rounded-full!" />
        <h2
          class="mt-4 font-display text-3xl font-extrabold tracking-tight text-(--text-primary) sm:text-4xl"
        >
          Questions fréquentes
        </h2>
        <p class="mt-3 text-base leading-relaxed text-(--text-secondary)">
          Tout ce que vous devez savoir avant de commencer votre préparation.
        </p>
      </div>

      <!-- Accordion + CTA -->
      <div ref="contentRef" class="mt-12">
        <Transition name="p-collapsible">
          <div v-if="contentVisible" class="grid">
            <div class="overflow-hidden">
              <Accordion class="flex flex-col gap-2.5">
                <AccordionPanel
                  v-for="item in faqs"
                  :key="item.q"
                  :value="item.q"
                >
                  <AccordionHeader
                    class="rounded-2xl! border! border-(--border-color)! bg-(--bg-card)! px-5! py-4.5! text-[0.9375rem] font-semibold! text-(--text-primary)! hover:bg-(--bg-hover)! [&_.p-accordionheader-toggle-icon]:text-primary-600!"
                  >
                    {{ item.q }}
                  </AccordionHeader>
                  <AccordionContent>
                    <p
                      class="m-0! border-t border-(--border-color) bg-(--bg-card)! px-5 py-4 text-[0.9375rem] leading-[1.75] text-(--text-secondary)"
                    >
                      {{ item.a }}
                    </p>
                  </AccordionContent>
                </AccordionPanel>
              </Accordion>

              <!-- CTA contact -->
              <div
                class="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-(--border-color) bg-(--bg-ground) p-8 text-center"
              >
                <p class="text-[0.9375rem] text-(--text-secondary)">
                  Vous ne trouvez pas de réponse à votre question ?
                </p>
                <NuxtLink to="/contact">
                  <Button
                    label="Contactez-nous"
                    icon="pi pi-envelope"
                    outlined
                    class="rounded-xl! border-primary-600! font-semibold! text-primary-600!"
                  />
                </NuxtLink>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const headerRef = ref(null);
const contentRef = ref(null);
const headerVisible = ref(false);
const contentVisible = ref(false);

let observer;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target === headerRef.value) headerVisible.value = true;
        if (entry.target === contentRef.value) contentVisible.value = true;
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );

  if (headerRef.value) observer.observe(headerRef.value);
  if (contentRef.value) observer.observe(contentRef.value);
});

onUnmounted(() => observer?.disconnect());

const faqs = [
  {
    q: "Les tests sont-ils similaires à l’examen réel ?",
    a: "Oui, nos tests reproduisent exactement les conditions du TCF Canada officiel : même format, même durée, même niveau de difficulté. Vous serez dans les meilleures conditions le jour J.",
  },
  {
    q: "Combien de temps faut-il pour se préparer au TCF Canada ?",
    a: "Cela dépend de votre niveau de départ et de l’objectif NCLC visé. En général, 3 à 6 semaines de préparation intensive suffisent pour progresser de 1 à 2 niveaux NCLC.",
  },
  {
    q: "Le simulateur IA corrige-t-il vraiment bien ?",
    a: "Notre simulateur est basé sur les critères officiels d’évaluation du TCF Canada. Il analyse la structure, le vocabulaire, la grammaire et la pertinence de vos productions en quelques secondes.",
  },
  {
    q: "Puis-je accéder à la plateforme depuis mon téléphone ?",
    a: "Absolument. Lumina est entièrement responsive et optimisée pour mobile, tablette et ordinateur. Révisez où que vous soyez, quand vous le souhaitez.",
  },
  {
    q: "Y a-t-il un accès gratuit ?",
    a: "Oui, vous pouvez découvrir l’interface et utiliser le calculateur NCLC sans créer de compte. L’accès complet aux tests et aux corrections IA nécessite un abonnement.",
  },
  {
    q: "Comment fonctionne le paiement ?",
    a: "Le paiement est sécurisé via Mobile Money (Orange Money, MTN MoMo) et carte bancaire. L’accès est activé immédiatement après confirmation du paiement.",
  },
];
</script>
