<script setup lang="ts">
import { site } from "~/config/site";

const featured = {
  icon: "pi pi-sparkles",
  title: "Simulateur IA",
  desc: "Correction automatique de vos textes selon les critères officiels du TCF Canada.",
  criteria: ["Structure", "Cohésion", "Vocabulaire", "Grammaire", "Réalisation de la tâche"],
};

const avantages = [
  {
    icon: "pi pi-chart-line",
    title: "Suivi de progression",
    desc: "Analysez vos performances en temps réel et identifiez précisément vos points à améliorer.",
  },
  {
    icon: "pi pi-refresh",
    title: "Version 2026",
    desc: "Contenus régulièrement mis à jour conformément aux dernières évolutions de l'examen.",
  },
  {
    icon: "pi pi-verified",
    title: "Conditions réelles",
    desc: "Simulez l'examen avec le même format, la même durée et le même niveau de difficulté.",
  },
  {
    icon: "pi pi-clock",
    title: "Accès 24h/24",
    desc: "Révisez à votre rythme, depuis n'importe quel appareil, où que vous soyez.",
  },
];

const community = {
  icon: "pi pi-users",
  title: "Communauté active",
  desc: "Rejoignez des milliers de candidats et partagez vos expériences de préparation.",
};

// Pastilles décoratives de la bande « communauté »
const avatars = ["A", "K", "M", "S", "Y"];
</script>

<template>
  <section class="border-y border-line bg-card px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
    <div class="mx-auto max-w-7xl">
      <SectionHeading
        :eyebrow="`Pourquoi ${site.name}`"
        title="Tout pour réussir, rien de superflu"
        subtitle="Des outils pensés pour maximiser votre progression en un minimum de temps."
      />

      <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Carte principale : simulateur IA -->
        <div v-reveal class="sm:col-span-2 lg:col-span-1 lg:row-span-2">
          <article
            class="featured-panel flex h-full flex-col justify-between gap-10 rounded-[2.5rem_0.5rem] p-8 text-white shadow-brand sm:p-10"
          >
            <div>
              <span class="grid size-13 place-items-center rounded-[1.2rem_0.4rem] bg-accent-400 text-accent-950 shadow-soft">
                <i :class="[featured.icon, 'text-xl']" />
              </span>
              <h3 class="mt-6 font-heading text-2xl font-extrabold tracking-tight md:text-3xl">
                {{ featured.title }}
              </h3>
              <p class="mt-3 max-w-sm leading-relaxed text-white/85">{{ featured.desc }}</p>
            </div>

            <div>
              <p class="text-xs font-semibold uppercase tracking-widest text-white/60">
                Critères évalués
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="criterion in featured.criteria"
                  :key="criterion"
                  class="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                >
                  <i class="pi pi-check text-[0.65rem] text-accent-400" />
                  {{ criterion }}
                </span>
              </div>
            </div>
          </article>
        </div>

        <!-- Cartes classiques -->
        <div
          v-for="(item, i) in avantages"
          :key="item.title"
          v-reveal="{ delay: 100 + i * 80 }"
          class="h-full"
        >
          <article
            class="group flex h-full flex-col rounded-card border border-line bg-canvas p-7 transition-all duration-300 ease-spring hover:-translate-y-1.5 hover:border-primary-200 hover:bg-card hover:shadow-lift dark:hover:border-primary-800"
          >
            <span
              class="flex size-12 items-center justify-center rounded-leaf bg-primary-50 text-primary-700 transition-all duration-300 ease-spring group-hover:brand-gradient group-hover:text-white group-hover:shadow-brand dark:bg-primary-950 dark:text-primary-300"
            >
              <i :class="[item.icon, 'text-xl']" />
            </span>
            <h3 class="mt-5 font-heading text-lg font-bold text-ink">{{ item.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-muted">{{ item.desc }}</p>
          </article>
        </div>

        <!-- Bande large : communauté -->
        <div v-reveal="{ delay: 200 }" class="sm:col-span-2 lg:col-span-3">
          <article
            class="flex flex-col gap-6 rounded-card border border-line bg-canvas p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <div class="flex items-start gap-5">
              <span class="flex size-12 shrink-0 items-center justify-center rounded-leaf bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300">
                <i :class="[community.icon, 'text-xl']" />
              </span>
              <div>
                <h3 class="font-heading text-lg font-bold text-ink">{{ community.title }}</h3>
                <p class="mt-1 text-sm leading-relaxed text-muted">{{ community.desc }}</p>
              </div>
            </div>

            <div aria-hidden="true" class="flex shrink-0 -space-x-3">
              <span
                v-for="(letter, i) in avatars"
                :key="letter"
                class="grid size-11 place-items-center rounded-full border-2 border-card font-heading text-sm font-bold text-white"
                :class="i % 2 === 0 ? 'brand-gradient' : 'bg-accent-400 text-accent-950'"
              >
                {{ letter }}
              </span>
              <span class="grid size-11 place-items-center rounded-full border-2 border-card bg-card-2 text-xs font-bold text-muted">
                3K+
              </span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>