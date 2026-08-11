<template>
  <div v-if="epreuve">
    <!-- ── Hero ─────────────────────────────────────────────── -->
    <section class="relative bg-gradient-primary pb-24 pt-16 text-center">
      <div class="container relative z-10 flex flex-col items-center gap-6">
        <h1
          class="m-0 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-[1.2] text-white"
        >
          {{ epreuve.title }} TCF Canada
        </h1>
        <p class="m-0 max-w-155 text-[1.0625rem] leading-[1.75] text-white/82">
          {{ epreuve.description }}
        </p>
      </div>
    </section>

    <!-- ── Format ─────────────────────────────────────────────── -->
    <section class="section bg-(--bg-ground) py-16">
      <div class="container">
        <div ref="formatRef">
          <Transition name="p-collapsible">
            <div v-if="formatVisible" class="grid">
              <div
                class="mx-auto grid max-w-160 grid-cols-3 gap-5 overflow-hidden"
              >
                <div
                  v-for="stat in epreuve.format"
                  :key="stat.label"
                  class="flex flex-col items-center gap-2 rounded-2xl border border-(--border-color) bg-(--bg-card) px-4 py-7 text-center"
                >
                  <div
                    class="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50"
                  >
                    <i :class="stat.icon" class="text-lg text-primary-600" />
                  </div>
                  <span
                    class="text-[1.625rem] font-extrabold leading-none text-(--text-primary)"
                    >{{ stat.value }}</span
                  >
                  <span
                    class="text-[0.8125rem] font-medium text-(--text-secondary)"
                    >{{ stat.label }}</span
                  >
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <!-- ── Ce que vous apprendrez ────────────────────────────── -->
    <section class="section bg-(--bg-section) py-20">
      <div class="container">
        <div
          ref="apprHeaderRef"
          class="mx-auto max-w-2xl text-center transition-all duration-700"
          :class="
            apprHeaderVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          "
        >
          <Tag value="Objectifs" severity="success" class="rounded-full!" />
          <h2
            class="mt-4 font-display text-3xl font-extrabold tracking-tight text-(--text-primary) sm:text-4xl"
          >
            Ce que vous apprendrez
          </h2>
        </div>

        <div ref="apprGridRef" class="mt-12">
          <Transition name="p-collapsible">
            <div v-if="apprGridVisible" class="grid">
              <div
                class="grid gap-5 overflow-hidden sm:grid-cols-2 lg:grid-cols-4"
              >
                <div
                  v-for="item in epreuve.apprentissages"
                  :key="item.title"
                  class="rounded-2xl border border-(--border-color) bg-(--bg-card) p-6"
                >
                  <div
                    class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50"
                  >
                    <i :class="item.icon" class="text-lg text-primary-600" />
                  </div>
                  <h3
                    class="m-0 mb-2 text-[0.9375rem] font-bold text-(--text-primary)"
                  >
                    {{ item.title }}
                  </h3>
                  <p class="m-0 text-sm leading-[1.6] text-(--text-secondary)">
                    {{ item.desc }}
                  </p>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <!-- ── Structure du programme ────────────────────────────── -->
    <section class="section bg-(--bg-ground) py-20">
      <div class="container">
        <div
          ref="progHeaderRef"
          class="mx-auto max-w-2xl text-center transition-all duration-700"
          :class="
            progHeaderVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          "
        >
          <Tag value="Programme" severity="warning" class="rounded-full!" />
          <h2
            class="mt-4 font-display text-3xl font-extrabold tracking-tight text-(--text-primary) sm:text-4xl"
          >
            Structure du programme
          </h2>
          <p class="mt-3 text-base leading-relaxed text-(--text-secondary)">
            Un programme complet pour vous préparer efficacement à l’épreuve.
          </p>
        </div>

        <div ref="progGridRef" class="mt-12">
          <Transition name="p-collapsible">
            <div v-if="progGridVisible" class="grid">
              <div
                class="grid gap-5 overflow-hidden sm:grid-cols-2 lg:grid-cols-4"
              >
                <div
                  v-for="item in epreuve.programme"
                  :key="item.title"
                  class="rounded-2xl border border-(--border-color) bg-(--bg-card) p-6 transition-all duration-250 hover:-translate-y-1 hover:border-primary-300 hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.1)]"
                >
                  <div
                    class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50"
                  >
                    <i :class="item.icon" class="text-lg text-primary-600" />
                  </div>
                  <h3
                    class="m-0 mb-2 text-[0.9375rem] font-bold text-(--text-primary)"
                  >
                    {{ item.title }}
                  </h3>
                  <p class="m-0 text-sm leading-[1.6] text-(--text-secondary)">
                    {{ item.desc }}
                  </p>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <!-- ── Tâches détaillées (EE & EO) ──────────────────────── -->
    <section v-if="epreuve.taches" class="section bg-(--bg-section) py-20">
      <div class="container">
        <div
          ref="tachesHeaderRef"
          class="mx-auto max-w-2xl text-center transition-all duration-700"
          :class="
            tachesHeaderVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          "
        >
          <Tag value="Détail" severity="success" class="rounded-full!" />
          <h2
            class="mt-4 font-display text-3xl font-extrabold tracking-tight text-(--text-primary) sm:text-4xl"
          >
            Les {{ epreuve.taches.length }} tâches de l’épreuve
          </h2>
          <p class="mt-3 text-base leading-relaxed text-(--text-secondary)">
            Découvrez en détail chaque tâche et ce qui est attendu.
          </p>
        </div>

        <div ref="tachesGridRef" class="mt-12">
          <Transition name="p-collapsible">
            <div v-if="tachesGridVisible" class="grid">
              <div class="flex flex-col gap-5 overflow-hidden">
                <div
                  v-for="tache in epreuve.taches"
                  :key="tache.numero"
                  class="flex gap-6 rounded-2xl border border-(--border-color) bg-(--bg-card) p-7 transition-all duration-250 hover:border-primary-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
                >
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-lg font-extrabold text-white"
                  >
                    {{ tache.numero }}
                  </div>
                  <div class="flex-1">
                    <div
                      class="mb-3 flex flex-wrap items-start justify-between gap-4"
                    >
                      <h3 class="m-0 text-base font-bold text-(--text-primary)">
                        {{ tache.title }}
                      </h3>
                      <div
                        class="flex flex-wrap gap-3.5 text-[0.8125rem] text-(--text-tertiary)"
                      >
                        <span
                          ><i class="pi pi-tag mr-1 text-xs" />
                          {{ tache.niveau }}</span
                        >
                        <span
                          ><i class="pi pi-align-left mr-1 text-xs" />
                          {{ tache.longueur }}</span
                        >
                        <span
                          ><i class="pi pi-clock mr-1 text-xs" />
                          {{ tache.temps }}</span
                        >
                      </div>
                    </div>
                    <p
                      class="m-0 mb-4 text-[0.9375rem] leading-[1.7] text-(--text-secondary)"
                    >
                      {{ tache.desc }}
                    </p>
                    <div>
                      <p
                        class="m-0 mb-2 text-[0.8125rem] font-bold uppercase tracking-wide text-(--text-secondary)"
                      >
                        Exemples :
                      </p>
                      <ul class="m-0 flex list-none flex-col gap-1.5 p-0">
                        <li
                          v-for="ex in tache.exemples"
                          :key="ex"
                          class="relative pl-4 text-sm text-(--text-secondary)"
                        >
                          <span class="absolute left-0 text-primary-500"
                            >→</span
                          >
                          {{ ex }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <!-- ── CTA Final ─────────────────────────────────────────── -->
    <section class="section bg-(--bg-ground) py-20">
      <div class="container">
        <div
          ref="ctaRef"
          class="mx-auto max-w-160 rounded-3xl border border-(--border-color) bg-(--bg-card) px-6 py-12 text-center transition-all duration-700"
          :class="
            ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          "
        >
          <h2
            class="m-0 mb-3 text-[clamp(1.375rem,3vw,1.875rem)] font-extrabold text-(--text-primary)"
          >
            Prêt à maîtriser l’{{ epreuve.title.toLowerCase() }} ?
          </h2>
          <p class="m-0 mb-8 text-base leading-[1.6] text-(--text-secondary)">
            Rejoignez des milliers de candidats qui se préparent avec Lumina
            TCF.
          </p>
          <div class="flex flex-wrap justify-center gap-3.5">
            <NuxtLink :to="epreuve.ctaFinal.to">
              <Button
                :label="epreuve.ctaFinal.label"
                :icon="epreuve.ctaFinal.icon"
                size="large"
                class="bg-gradient-primary! border-none! rounded-xl! font-bold!"
              />
            </NuxtLink>
            <NuxtLink to="/tarifs">
              <Button
                label="Voir les prix"
                icon="pi pi-dollar"
                size="large"
                outlined
                class="border-primary-600! text-primary-600! rounded-xl! font-semibold!"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- 404 -->
  <div v-else class="container py-20 text-center">
    <h2 class="text-(--text-primary)">Épreuve introuvable.</h2>
    <NuxtLink to="/">
      <Button
        label="Retour à l’accueil"
        icon="pi pi-home"
        class="bg-gradient-primary! border-none! rounded-xl! font-semibold!"
      />
    </NuxtLink>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useEpreuve } from "~/composables/useEpreuve";

const route = useRoute();
const { epreuve } = useEpreuve(route.params.slug);

useHead({
  title: epreuve ? `${epreuve.title} TCF Canada | Lumina` : "Épreuve | Lumina",
  meta: [
    {
      name: "description",
      content: epreuve?.description ?? "",
    },
  ],
});

const formatRef = ref(null);
const apprHeaderRef = ref(null);
const apprGridRef = ref(null);
const progHeaderRef = ref(null);
const progGridRef = ref(null);
const tachesHeaderRef = ref(null);
const tachesGridRef = ref(null);
const ctaRef = ref(null);

const formatVisible = ref(false);
const apprHeaderVisible = ref(false);
const apprGridVisible = ref(false);
const progHeaderVisible = ref(false);
const progGridVisible = ref(false);
const tachesHeaderVisible = ref(false);
const tachesGridVisible = ref(false);
const ctaVisible = ref(false);

const visibilityMap = [
  [formatRef, formatVisible],
  [apprHeaderRef, apprHeaderVisible],
  [apprGridRef, apprGridVisible],
  [progHeaderRef, progHeaderVisible],
  [progGridRef, progGridVisible],
  [tachesHeaderRef, tachesHeaderVisible],
  [tachesGridRef, tachesGridVisible],
  [ctaRef, ctaVisible],
];

let observer;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const match = visibilityMap.find(
          ([elRef]) => elRef.value === entry.target,
        );
        if (match) match[1].value = true;
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );

  visibilityMap.forEach(([elRef]) => {
    if (elRef.value) observer.observe(elRef.value);
  });
});

onUnmounted(() => observer?.disconnect());
</script>
