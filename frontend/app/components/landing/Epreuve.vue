<script setup lang="ts">
const epreuves = [
  {
    slug: "co",
    title: "Compréhension orale",
    desc: "Écoutez des documents audio variés et répondez aux questions de compréhension.",
    icon: "pi pi-headphones",
    questions: "39 questions",
    duration: "35 minutes",
    path: "/epreuve/comprehension-orale",
  },
  {
    slug: "ce",
    title: "Compréhension écrite",
    desc: "Lisez des textes authentiques et répondez aux questions de compréhension.",
    icon: "pi pi-book",
    questions: "39 questions",
    duration: "60 minutes",
    path: "/epreuve/comprehension-ecrite",
  },
  {
    slug: "eo",
    title: "Expression orale",
    desc: "Exprimez-vous oralement sur des sujets d'actualité avec nos sujets guidés.",
    icon: "pi pi-microphone",
    questions: "3 tâches",
    duration: "12 minutes",
    path: "/epreuve/expression-orale",
  },
  {
    slug: "ee",
    title: "Expression écrite",
    desc: "Rédigez des textes de différents types et obtenez une correction IA détaillée.",
    icon: "pi pi-pen-to-square",
    questions: "3 tâches",
    duration: "60 minutes",
    path: "/epreuve/expression-ecrite",
  },
];
</script>

<template>
  <section class="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
    <div class="mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="Les épreuves"
        title="Les 4 épreuves du TCF Canada"
        subtitle="Entraînez-vous module par module avec nos simulateurs spécialisés en conditions réelles."
      />

      <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(epreuve, i) in epreuves"
          :key="epreuve.slug"
          v-reveal="{ delay: i * 100 }"
          class="h-full"
        >
          <NuxtLink
            :to="epreuve.path"
            class="group flex h-full flex-col rounded-card border border-line bg-card p-7 shadow-soft transition-all duration-300 ease-spring hover:-translate-y-1.5 hover:border-primary-200 hover:shadow-lift dark:hover:border-primary-800"
          >
            <!-- Icône -->
            <span
              class="flex size-13 items-center justify-center rounded-leaf bg-primary-50 text-primary-700 transition-all duration-300 ease-spring group-hover:brand-gradient group-hover:text-white group-hover:shadow-brand dark:bg-primary-950 dark:text-primary-300"
            >
              <i :class="[epreuve.icon, 'text-[1.375rem]']" />
            </span>

            <!-- Contenu -->
            <div class="mt-5 flex-1">
              <h3 class="font-heading text-lg font-bold text-ink">{{ epreuve.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-muted">{{ epreuve.desc }}</p>

              <div class="mt-4 flex flex-wrap gap-2">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-card-2 px-3 py-1 text-xs font-medium text-muted">
                  <i class="pi pi-list text-[0.7rem]" />
                  {{ epreuve.questions }}
                </span>
                <span class="inline-flex items-center gap-1.5 rounded-full bg-card-2 px-3 py-1 text-xs font-medium text-muted">
                  <i class="pi pi-clock text-[0.7rem]" />
                  {{ epreuve.duration }}
                </span>
              </div>
            </div>

            <!-- CTA -->
            <div class="mt-6 border-t border-line pt-4">
              <span class="flex items-center gap-2 text-sm font-semibold text-primary">
                Commencer
                <i class="pi pi-arrow-right text-xs transition-transform duration-300 ease-spring group-hover:translate-x-1" />
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>