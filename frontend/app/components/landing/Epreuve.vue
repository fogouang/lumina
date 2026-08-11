<template>
  <section class="section bg-(--bg-section) py-20">
    <div class="container">
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
        <Tag value="Les épreuves" severity="success" class="rounded-full!" />
        <h2
          class="mt-4 font-display text-3xl font-extrabold tracking-tight text-(--text-primary) sm:text-4xl"
        >
          Les 4 épreuves du TCF Canada
        </h2>
        <p class="mt-3 text-base leading-relaxed text-(--text-secondary)">
          Entraînez-vous module par module avec nos simulateurs spécialisés en
          conditions réelles.
        </p>
      </div>

      <!-- Grid -->
      <div ref="gridRef" class="mt-12">
        <Transition name="p-collapsible">
          <div v-if="gridVisible" class="grid">
            <div
              class="grid gap-5 overflow-hidden sm:grid-cols-2 lg:grid-cols-4"
            >
              <NuxtLink
                v-for="epreuve in epreuves"
                :key="epreuve.slug"
                :to="epreuve.path"
                class="group flex flex-col gap-4 rounded-2xl border border-(--border-color) bg-(--bg-card) p-6 no-underline text-inherit transition-all duration-250 hover:-translate-y-1 hover:border-primary-300 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.1)]"
              >
                <!-- Icône -->
                <div
                  class="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl"
                  :style="{ background: epreuve.iconBg }"
                >
                  <i
                    :class="epreuve.icon"
                    class="text-[1.375rem]"
                    :style="{ color: epreuve.iconColor }"
                  />
                </div>

                <!-- Contenu -->
                <div class="flex-1">
                  <h3 class="text-base font-bold text-(--text-primary)">
                    {{ epreuve.title }}
                  </h3>
                  <p
                    class="mt-1.5 text-sm leading-relaxed text-(--text-secondary)"
                  >
                    {{ epreuve.desc }}
                  </p>
                  <div
                    class="mt-3.5 flex gap-4 text-[0.8125rem] text-(--text-tertiary)"
                  >
                    <span class="flex items-center gap-1">
                      <i class="pi pi-list text-xs" />
                      {{ epreuve.questions }}
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="pi pi-clock text-xs" />
                      {{ epreuve.duration }}
                    </span>
                  </div>
                </div>

                <!-- CTA -->
                <div class="border-t border-(--border-color) pt-3.5">
                  <span
                    class="flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-[gap] duration-200 group-hover:gap-2.5"
                  >
                    Commencer
                    <i class="pi pi-arrow-right text-xs" />
                  </span>
                </div>
              </NuxtLink>
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
    { threshold: 0.15 },
  );

  if (headerRef.value) observer.observe(headerRef.value);
  if (gridRef.value) observer.observe(gridRef.value);
});

onUnmounted(() => observer?.disconnect());

const epreuves = [
  {
    slug: "co",
    title: "Compréhension orale",
    desc: "Écoutez des documents audio variés et répondez aux questions de compréhension.",
    icon: "pi pi-headphones",
    iconColor: "#0d9488",
    iconBg: "#f0fdfa",
    questions: "39 questions",
    duration: "35 minutes",
    path: "/epreuve/comprehension-orale",
  },
  {
    slug: "ce",
    title: "Compréhension écrite",
    desc: "Lisez des textes authentiques et répondez aux questions de compréhension.",
    icon: "pi pi-book",
    iconColor: "#1d4ed8",
    iconBg: "#eff6ff",
    questions: "39 questions",
    duration: "60 minutes",
    path: "/epreuve/comprehension-ecrite",
  },
  {
    slug: "eo",
    title: "Expression orale",
    desc: "Exprimez-vous oralement sur des sujets d’actualité avec nos sujets guidés.",
    icon: "pi pi-microphone",
    iconColor: "#d97706",
    iconBg: "#fffbeb",
    questions: "3 tâches",
    duration: "12 minutes",
    path: "/epreuve/expression-orale",
  },
  {
    slug: "ee",
    title: "Expression écrite",
    desc: "Rédigez des textes de différents types et obtenez une correction IA détaillée.",
    icon: "pi pi-pen-to-square",
    iconColor: "#7c3aed",
    iconBg: "#f5f3ff",
    questions: "3 tâches",
    duration: "60 minutes",
    path: "/epreuve/expression-ecrite",
  },
];
</script>
