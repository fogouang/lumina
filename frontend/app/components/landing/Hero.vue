<script setup lang="ts">
import { site } from "~/config/site";

const { openLogin } = useAuthModal();

const stats = [
  { value: "3K+", label: "Candidats" },
  { value: "4", label: "Modules" },
  { value: "10K+", label: "Tests réalisés" },
];

// Versions claires des variables du design system, pour le fond sombre du hero
const darkSurfaceVars = {
  "--app-text-gradient":
    "linear-gradient(120deg, var(--p-brand-200) 0%, var(--p-brand-400) 55%, var(--p-accent-400) 100%)",
};
</script>

<template>
  <section
    class="relative isolate flex min-h-[92vh] items-center overflow-hidden"
    :style="darkSurfaceVars"
  >
    <!-- Image de fond -->
    <div class="absolute inset-0 -z-10">
      <img
        src="/images/hero.jpg"
        alt=""
        class="hero-zoom h-full w-full object-cover object-[70%_20%]"
      />
      <!-- Voile de marque : dense à gauche pour le texte, léger à droite pour la photo -->
      <div
        class="absolute inset-0 bg-linear-to-r from-primary-950/95 via-primary-950/75 to-primary-950/25"
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-primary-950/60 via-transparent to-primary-950/40"
      />
      <!-- Grille blanche très discrète -->
      <div
        class="bg-grid animate-grid-drift absolute inset-0"
        style="--app-line: rgba(255, 255, 255, 0.06)"
      />
      <!-- Halo jaune -->
      <div
        class="animate-float absolute -left-24 bottom-0 size-104 rounded-full bg-accent-400/15 blur-3xl"
      />
      <!-- Fondu vers la section suivante -->
      <div
        class="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-canvas"
      />
    </div>

    <div
      class="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-28 pt-32 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:px-8 lg:pt-40"
    >
      <!-- Texte -->
      <div>
        <h1
          v-reveal="{ delay: 100 }"
          class="mt-6 max-w-2xl font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Visez le score qui vous ouvre les portes du
          <span class="text-accent-400">Canada</span>.
        </h1>

        <p
          v-reveal="{ delay: 200 }"
          class="mt-6 max-w-xl text-lg leading-relaxed text-white/80"
        >
          Des sujets récents mis à jour chaque mois, un simulateur fidèle à
          l'examen pour les quatre épreuves et une correction IA qui vous dit
          exactement quoi améliorer. Le jour J, vous saurez déjà à quoi vous
          attendre.
        </p>

        <div
          v-reveal="{ delay: 300 }"
          class="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <AppCta
            to="/tarifs"
            label="Voir les prix"
            icon="pi pi-arrow-right"
            variant="light"
          />
          <AppCta
            label="Pratiquer"
            icon="pi pi-sign-in"
            icon-pos="left"
            variant="glass"
            @click="openLogin()"
          />
        </div>

        <div
          v-reveal="{ delay: 400 }"
          class="mt-12 max-w-md border-t border-white/20 pt-8"
        >
          <p
            class="text-xs font-semibold uppercase tracking-widest text-white/60"
          >
            Utilisé par des milliers de candidats
          </p>
          <dl class="mt-4 grid grid-cols-3 gap-6">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="flex flex-col-reverse"
            >
              <dt class="mt-1 text-sm text-white/65">{{ stat.label }}</dt>
              <dd class="font-heading text-3xl font-extrabold text-white">
                {{ stat.value }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Cartes en verre (desktop) -->
      <div class="relative hidden h-full min-h-104 lg:block">
        <div
          v-reveal="{ from: 'right', delay: 500 }"
          class="absolute right-0 top-8"
        >
          <div
            class="animate-float flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 shadow-lift backdrop-blur-md"
          >
            <span
              class="flex size-10 items-center justify-center rounded-[0.95rem_0.3rem] bg-accent-400 text-accent-950"
            >
              <i class="pi pi-bolt" />
            </span>
            <div>
              <p class="text-xs text-white/70">Correction IA</p>
              <p class="text-sm font-semibold text-white">Instantanée</p>
            </div>
          </div>
        </div>

        <div
          v-reveal="{ from: 'right', delay: 650 }"
          class="absolute bottom-8 right-16"
        >
          <div
            class="animate-float flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 shadow-lift backdrop-blur-md [animation-delay:-2.5s]"
          >
            <span
              class="flex size-10 items-center justify-center rounded-[0.95rem_0.3rem] bg-white text-primary-800"
            >
              <i class="pi pi-microphone" />
            </span>
            <div>
              <p class="text-xs text-white/70">Expression orale</p>
              <p class="text-sm font-semibold text-white">Évaluée en direct</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Léger zoom arrière de l'image au chargement */
.hero-zoom {
  animation: hero-zoom 1.8s var(--ease-spring) both;
}

@keyframes hero-zoom {
  from {
    transform: scale(1.08);
  }
  to {
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-zoom {
    animation: none;
  }
}
</style>
