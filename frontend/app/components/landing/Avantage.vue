<template>
  <section class="section bg-(--bg-ground) py-20">
    <div class="container">
      <!-- Header -->
      <div
        ref="headerRef"
        class="mx-auto max-w-2xl text-center transition-all duration-700"
        :class="headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <Tag value="Pourquoi Lumina" severity="warning" class="rounded-full!" />
        <h2 class="mt-4 font-display text-3xl font-extrabold tracking-tight text-(--text-primary) sm:text-4xl">
          Tout pour réussir, rien de superflu
        </h2>
        <p class="mt-3 text-base leading-relaxed text-(--text-secondary)">
          Des outils pensés pour maximiser votre progression en un minimum de temps.
        </p>
      </div>

      <!-- Grid -->
      <div ref="gridRef" class="mt-12">
        <Transition name="p-collapsible">
          <div v-if="gridVisible" class="grid">
            <div class="grid gap-5 overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="item in avantages"
                :key="item.title"
                class="rounded-2xl border border-(--border-color) bg-(--bg-card) p-7 transition-all duration-250 hover:-translate-y-1 hover:border-primary-300 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.1)]"
              >
                <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                  <i :class="item.icon" class="text-xl text-primary-600" />
                </div>
                <h3 class="text-base font-bold text-(--text-primary)">{{ item.title }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-(--text-secondary)">{{ item.desc }}</p>
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
const gridRef = ref(null);
const headerVisible = ref(false);
const gridVisible = ref(false);

let observer;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (entry.target === headerRef.value) headerVisible.value = true;
        if (entry.target === gridRef.value) gridVisible.value = true;
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  if (headerRef.value) observer.observe(headerRef.value);
  if (gridRef.value) observer.observe(gridRef.value);
});

onUnmounted(() => observer?.disconnect());

const avantages = [
  {
    icon: "pi pi-chart-line",
    title: "Suivi de progression",
    desc: "Analysez vos performances en temps réel et identifiez précisément vos points à améliorer.",
  },
  {
    icon: "pi pi-sparkles",
    title: "Simulateur IA",
    desc: "Correction automatique de vos textes selon les critères officiels du TCF Canada.",
  },
  {
    icon: "pi pi-refresh",
    title: "Version 2026",
    desc: "Contenus régulièrement mis à jour conformément aux dernières évolutions de l’examen.",
  },
  {
    icon: "pi pi-verified",
    title: "Conditions réelles",
    desc: "Simulez l’examen avec le même format, la même durée et le même niveau de difficulté.",
  },
  {
    icon: "pi pi-clock",
    title: "Accès 24h/24",
    desc: "Révisez à votre rythme, depuis n’importe quel appareil, où que vous soyez.",
  },
  {
    icon: "pi pi-users",
    title: "Communauté active",
    desc: "Rejoignez des milliers de candidats et partagez vos expériences de préparation.",
  },
];
</script>