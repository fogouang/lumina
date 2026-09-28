<template>
  <div v-if="epreuve">
    <!-- Hero -->
    <section class="featured-panel px-4 pb-36 pt-32 sm:px-6 lg:px-8 lg:pt-40">
      <div
        class="bg-grid animate-grid-drift pointer-events-none absolute inset-0"
        style="--app-line: rgba(255, 255, 255, 0.06)"
      />

      <div class="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <nav v-reveal aria-label="Fil d'Ariane" class="flex items-center gap-2 text-sm text-white/70">
          <NuxtLink to="/" class="transition-colors hover:text-white">Accueil</NuxtLink>
          <i class="pi pi-angle-right text-xs text-white/40" />
          <span class="text-white/70">Épreuves</span>
          <i class="pi pi-angle-right text-xs text-white/40" />
          <span class="font-semibold text-white">{{ epreuve.title }}</span>
        </nav>

        <h1
          v-reveal="{ delay: 100 }"
          class="mt-6 font-heading text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight text-white"
        >
          {{ epreuve.title }}
          <span class="text-accent-400">TCF Canada</span>
        </h1>

        <p v-reveal="{ delay: 200 }" class="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
          {{ epreuve.description }}
        </p>

        <div v-reveal="{ delay: 300 }" class="mt-9 flex flex-col gap-3 sm:flex-row">
          <AppCta
            :to="epreuve.ctaFinal.to"
            :label="epreuve.ctaFinal.label"
            :icon="epreuve.ctaFinal.icon"
            icon-pos="left"
            variant="light"
          />
          <AppCta to="/tarifs" label="Voir les prix" icon="pi pi-arrow-right" variant="glass" />
        </div>
      </div>
    </section>

    <!-- Format : chevauche le bas du hero -->
    <section class="relative z-10 -mt-20 px-4 sm:px-6 lg:px-8">
      <div class="mx-auto grid max-w-3xl grid-cols-3 gap-3 sm:gap-5">
        <div
          v-for="(stat, i) in epreuve.format"
          :key="stat.label"
          v-reveal="{ delay: 350 + i * 100 }"
        >
          <div class="flex h-full flex-col items-center gap-2 rounded-card border border-line bg-card px-3 py-6 text-center shadow-lift sm:py-7">
            <span class="mb-1 grid size-11 place-items-center rounded-leaf bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              <i :class="[stat.icon, 'text-lg']" />
            </span>
            <span class="font-heading text-2xl font-extrabold leading-none text-ink sm:text-[1.75rem]">
              {{ stat.value }}
            </span>
            <span class="text-xs font-medium text-muted sm:text-sm">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Ce que vous apprendrez -->
    <section class="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div class="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Objectifs" title="Ce que vous apprendrez" />

        <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(item, i) in epreuve.apprentissages"
            :key="item.title"
            v-reveal="{ delay: i * 100 }"
            class="h-full"
          >
            <article
              class="group flex h-full flex-col rounded-card border border-line bg-card p-7 shadow-soft transition-all duration-300 ease-spring hover:-translate-y-1.5 hover:border-primary-200 hover:shadow-lift dark:hover:border-primary-800"
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
        </div>
      </div>
    </section>

    <!-- Structure du programme -->
    <section class="border-y border-line bg-card px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div class="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Programme"
          title="Structure du programme"
          subtitle="Un programme complet pour vous préparer efficacement à l'épreuve."
        />

        <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(item, i) in epreuve.programme"
            :key="item.title"
            v-reveal="{ delay: i * 100 }"
            class="h-full"
          >
            <article
              class="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-canvas p-7 transition-all duration-300 ease-spring hover:-translate-y-1.5 hover:border-primary-200 hover:bg-card hover:shadow-lift dark:hover:border-primary-800"
            >
              <span class="absolute right-5 top-4 font-heading text-5xl font-extrabold text-gradient opacity-30 transition-opacity duration-300 group-hover:opacity-100">
                {{ String(i + 1).padStart(2, "0") }}
              </span>
              <span class="flex size-12 items-center justify-center rounded-leaf bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                <i :class="[item.icon, 'text-xl']" />
              </span>
              <h3 class="mt-5 font-heading text-lg font-bold text-ink">{{ item.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-muted">{{ item.desc }}</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Tâches détaillées (EE et EO) -->
    <section v-if="epreuve.taches" class="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div class="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Détail"
          :title="`Les ${epreuve.taches.length} tâches de l'épreuve`"
          subtitle="Découvrez en détail chaque tâche et ce qui est attendu."
        />

        <div class="mt-14 flex flex-col gap-6">
          <div
            v-for="(tache, i) in epreuve.taches"
            :key="tache.numero"
            v-reveal="{ from: i % 2 === 0 ? 'left' : 'right' }"
          >
            <article
              class="flex flex-col gap-6 rounded-[2rem_0.5rem] border border-line bg-card p-7 shadow-soft transition-all duration-300 ease-spring hover:border-primary-200 hover:shadow-lift sm:flex-row sm:p-8 dark:hover:border-primary-800"
            >
              <span
                class="brand-gradient grid size-14 shrink-0 place-items-center rounded-leaf font-heading text-xl font-extrabold text-white shadow-brand"
              >
                {{ tache.numero }}
              </span>

              <div class="flex-1">
                <h3 class="font-heading text-xl font-bold text-ink">{{ tache.title }}</h3>

                <div class="mt-3 flex flex-wrap gap-2">
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                    <i class="pi pi-tag text-[0.7rem]" />
                    {{ tache.niveau }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-card-2 px-3 py-1 text-xs font-medium text-muted">
                    <i class="pi pi-align-left text-[0.7rem]" />
                    {{ tache.longueur }}
                  </span>
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-card-2 px-3 py-1 text-xs font-medium text-muted">
                    <i class="pi pi-clock text-[0.7rem]" />
                    {{ tache.temps }}
                  </span>
                </div>

                <p class="mt-4 leading-relaxed text-muted">{{ tache.desc }}</p>

                <div class="mt-5 rounded-2xl bg-canvas p-5">
                  <p class="text-xs font-semibold uppercase tracking-widest text-faint">Exemples</p>
                  <ul class="mt-3 flex flex-col gap-2">
                    <li
                      v-for="ex in tache.exemples"
                      :key="ex"
                      class="flex items-start gap-2.5 text-sm text-muted"
                    >
                      <i class="pi pi-arrow-right mt-1 text-[0.7rem] text-primary" />
                      <span>{{ ex }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div v-reveal="{ from: 'zoom' }" class="mx-auto max-w-5xl">
        <div class="featured-panel rounded-[2.5rem_0.5rem] px-8 py-14 text-center shadow-brand sm:px-16">
          <h2 class="font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold tracking-tight text-white">
            Prêt à vous lancer en {{ epreuve.title.toLowerCase() }} ?
          </h2>
          <p class="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Rejoignez des milliers de candidats qui se préparent avec {{ site.name }}.
          </p>
          <div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <AppCta
              :to="epreuve.ctaFinal.to"
              :label="epreuve.ctaFinal.label"
              :icon="epreuve.ctaFinal.icon"
              icon-pos="left"
              variant="light"
            />
            <AppCta to="/tarifs" label="Voir les prix" icon="pi pi-arrow-right" variant="glass" />
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- 404 -->
  <section v-else class="featured-panel flex min-h-[70vh] items-center px-4 pb-24 pt-32 sm:px-6 lg:px-8">
    <div class="relative mx-auto flex max-w-xl flex-col items-center text-center">
      <span class="grid size-14 place-items-center rounded-[1.2rem_0.4rem] bg-accent-400 text-accent-950 shadow-soft">
        <i class="pi pi-search text-xl" />
      </span>
      <h1 class="mt-6 font-heading text-3xl font-extrabold text-white sm:text-4xl">Épreuve introuvable</h1>
      <p class="mt-3 text-white/80">Cette épreuve n'existe pas ou a été déplacée.</p>
      <AppCta to="/" label="Retour à l'accueil" icon="pi pi-home" icon-pos="left" variant="light" class="mt-8" />
    </div>
  </section>
</template>

<script setup>
import { useEpreuve } from "~/composables/useEpreuve";
import { site } from "~/config/site";

definePageMeta({ navbarOverlay: true });

const route = useRoute();
const { epreuve } = useEpreuve(route.params.slug);

useHead({
  title: epreuve ? `${epreuve.title} TCF Canada | ${site.name}` : `Épreuve | ${site.name}`,
  meta: [
    {
      name: "description",
      content: epreuve?.description ?? "",
    },
  ],
});
</script>