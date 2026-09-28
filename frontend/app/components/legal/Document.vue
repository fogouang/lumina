<script setup lang="ts">
import type { LegalSection } from "~/types/legal";
import { site } from "~/config/site";

const props = withDefaults(
  defineProps<{
    title: string;
    highlight?: string;
    subtitle?: string;
    sections: LegalSection[];
    contactIntro?: string;
  }>(),
  {
    contactIntro:
      "Pour toute question relative à ce document, vous pouvez nous contacter :",
  },
);

// « 1. Objet » devient « Objet » (le numéro est affiché dans la pastille)
const stripNumber = (title: string) => title.replace(/^\d+\.\s*/, "");
const sectionId = (index: number) => `section-${index + 1}`;
const contactId = computed(() => `section-${props.sections.length + 1}`);

const toc = computed(() => [
  ...props.sections.map((s, i) => ({
    id: sectionId(i),
    title: `${i + 1}. ${stripNumber(s.title)}`,
  })),
  { id: contactId.value, title: `${props.sections.length + 1}. Contact` },
]);
</script>

<template>
  <div>
    <!-- Hero -->
    <section
      class="featured-panel px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pb-24 lg:pt-40"
    >
      <div
        class="bg-grid animate-grid-drift pointer-events-none absolute inset-0"
        style="--app-line: rgba(255, 255, 255, 0.06)"
      />

      <div
        class="relative mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <span
          v-reveal
          class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md"
        >
          <i class="pi pi-shield text-[0.7rem] text-accent-400" />
          Informations légales
        </span>
        <h1
          v-reveal="{ delay: 100 }"
          class="mt-6 font-heading text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold leading-[1.1] tracking-tight text-white"
        >
          {{ title }}
          <span v-if="highlight" class="text-accent-400">{{ highlight }}</span>
        </h1>
        <p v-if="subtitle" v-reveal="{ delay: 200 }" class="mt-4 text-white/70">
          {{ subtitle }}
        </p>
      </div>
    </section>

    <!-- Contenu -->
    <section class="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div
        class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[16rem_1fr] lg:gap-12"
      >
        <!-- Sommaire -->
        <aside class="hidden lg:block">
          <nav
            v-reveal="{ from: 'left' }"
            aria-label="Sommaire"
            class="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-card border border-line bg-card p-5 shadow-soft"
          >
            <p
              class="px-2 text-xs font-semibold uppercase tracking-widest text-faint"
            >
              Sommaire
            </p>
            <ul class="mt-3 flex flex-col gap-0.5">
              <li v-for="item in toc" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  class="block rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-card-2 hover:text-primary"
                >
                  {{ item.title }}
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <!-- Sections -->
        <div
          v-reveal="{ delay: 100 }"
          class="rounded-[2rem_0.5rem] border border-line bg-card p-6 shadow-lift sm:p-10"
        >
          <article
            v-for="(section, index) in sections"
            :id="sectionId(index)"
            :key="index"
            class="scroll-mt-28 border-line py-8 first:pt-0 not-first:border-t"
          >
            <h2
              class="flex items-center gap-3 font-heading text-xl font-bold text-ink"
            >
              <span
                class="grid size-8 shrink-0 place-items-center rounded-[0.8rem_0.25rem] bg-primary-50 text-sm font-extrabold text-primary-700 dark:bg-primary-950 dark:text-primary-300"
              >
                {{ index + 1 }}
              </span>
              {{ stripNumber(section.title) }}
            </h2>

            <p
              v-if="section.intro"
              class="mt-4 text-[0.9375rem] leading-relaxed text-muted"
            >
              {{ section.intro }}
            </p>

            <ul v-if="section.items" class="mt-4 flex flex-col gap-2.5">
              <li
                v-for="(item, i) in section.items"
                :key="i"
                class="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-muted [&_strong]:font-semibold [&_strong]:text-ink"
              >
                <i
                  class="pi pi-check-circle mt-1 shrink-0 text-sm text-primary"
                />
                <span v-html="item" />
              </li>
            </ul>

            <!-- Sous-sections -->
            <div
              v-for="(sub, si) in section.subs"
              :key="si"
              class="mt-6 rounded-2xl bg-canvas p-5"
            >
              <h3 class="font-heading text-base font-semibold text-ink">
                {{ sub.title }}
              </h3>
              <ul class="mt-3 flex flex-col gap-2.5">
                <li
                  v-for="(item, ii) in sub.items"
                  :key="ii"
                  class="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-muted"
                >
                  <i
                    class="pi pi-check-circle mt-1 shrink-0 text-sm text-primary"
                  />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <!-- Avertissement -->
            <div
              v-if="section.warning"
              class="mt-5 flex items-start gap-3 rounded-xl border-l-4 border-accent-500 bg-accent-50 px-4 py-3 dark:bg-accent-950"
            >
              <i
                class="pi pi-exclamation-triangle mt-0.5 shrink-0 text-accent-700 dark:text-accent-300"
              />
              <p
                class="text-[0.9375rem] font-medium leading-relaxed text-accent-900 dark:text-accent-200"
              >
                {{ section.warning }}
              </p>
            </div>

            <!-- Conclusion -->
            <p
              v-if="section.outro"
              class="mt-4 border-l-2 border-primary pl-4 text-[0.9375rem] font-semibold leading-relaxed text-ink"
            >
              {{ section.outro }}
            </p>
          </article>

          <!-- Contact -->
          <article
            :id="contactId"
            class="scroll-mt-28 border-t border-line pt-8"
          >
            <h2
              class="flex items-center gap-3 font-heading text-xl font-bold text-ink"
            >
              <span
                class="brand-gradient grid size-8 shrink-0 place-items-center rounded-[0.8rem_0.25rem] text-sm font-extrabold text-white"
              >
                {{ sections.length + 1 }}
              </span>
              Contact
            </h2>
            <p class="mt-4 text-[0.9375rem] leading-relaxed text-muted">
              {{ contactIntro }}
            </p>
            <div class="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                :href="`mailto:${site.contact.email}`"
                class="inline-flex items-center gap-3 rounded-leaf bg-primary-50 px-5 py-3 text-[0.9375rem] font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-300 dark:hover:bg-primary-900"
              >
                <i class="pi pi-envelope" />
                {{ site.contact.email }}
              </a>

              <a
                :href="`tel:${site.contact.phone.replace(/\s/g, '')}`"
                class="inline-flex items-center gap-3 rounded-leaf bg-primary-50 px-5 py-3 text-[0.9375rem] font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-300 dark:hover:bg-primary-900"
              >
                <i class="pi pi-phone" />
                {{ site.contact.phone }}
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
