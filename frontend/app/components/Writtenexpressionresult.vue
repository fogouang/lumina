<script setup lang="ts">
interface CriterionDisplay {
  name: string;
  score: number;
  max: number;
  feedback: string;
}

interface TaskFeedback {
  taskNumber: number;
  correctedText: string;
}

const props = defineProps<{
  overallScore: number; // /20
  cecrlLevel: string;
  appreciation: string;
  criteria: CriterionDisplay[];
  tasks: TaskFeedback[];
  corrections: unknown[];
  suggestions: unknown[];
}>();

function itemText(item: unknown, keys: string[]): string | null {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    for (const k of keys) {
      const v = (item as Record<string, unknown>)[k];
      if (typeof v === "string" && v) return v;
    }
  }
  return null;
}

function correctionOriginal(item: unknown): string | null {
  return itemText(item, ["original", "text", "avant"]);
}
function correctionFixed(item: unknown): string | null {
  return itemText(item, ["corrected", "correction", "suggestion", "apres"]);
}
function correctionExplanation(item: unknown): string | null {
  return itemText(item, ["explanation", "explication", "comment"]);
}
function suggestionText(item: unknown): string {
  return itemText(item, ["text", "suggestion", "message"]) ?? String(item);
}

// Affichage uniquement
const scorePercent = computed(() => Math.round((props.overallScore / 20) * 100));

const ringStyle = computed(() => ({
  background: `conic-gradient(var(--p-accent-400) ${scorePercent.value}%, rgba(255, 255, 255, 0.15) 0)`,
}));

function barTone(score: number, max: number): string {
  const ratio = max ? score / max : 0;
  if (ratio >= 0.75) return "bg-green-500";
  if (ratio >= 0.5) return "brand-gradient";
  return "bg-accent-400";
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Score global -->
    <div v-reveal class="featured-panel rounded-[2rem_0.5rem] p-6 text-white shadow-brand sm:p-8">
      <div class="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <div class="grid size-32 shrink-0 place-items-center rounded-full p-2" :style="ringStyle">
          <div class="grid size-full place-items-center rounded-full bg-primary-900">
            <div class="text-center">
              <p class="font-heading text-4xl font-extrabold leading-none">{{ overallScore }}</p>
              <p class="mt-1 text-xs font-semibold text-white/60">sur 20</p>
            </div>
          </div>
        </div>

        <div class="min-w-0">
          <div class="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <p class="text-xs font-semibold uppercase tracking-widest text-white/60">Score global</p>
            <span class="rounded-full bg-accent-400 px-3 py-0.5 font-heading text-sm font-extrabold text-accent-950">
              {{ cecrlLevel }}
            </span>
          </div>
          <p class="mt-3 leading-relaxed text-white/90">{{ appreciation }}</p>
        </div>
      </div>
    </div>

    <!-- Critères -->
    <div v-reveal="{ delay: 80 }" class="rounded-card border border-line bg-card p-6 shadow-soft">
      <h3 class="mb-5 border-b border-line pb-3.5 font-heading text-base font-bold text-ink">Détail par critère</h3>
      <div class="grid gap-5 md:grid-cols-2">
        <div v-for="c in criteria" :key="c.name" class="rounded-2xl bg-canvas p-4">
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm font-semibold text-ink">{{ c.name }}</span>
            <span class="font-heading text-sm font-extrabold text-ink">
              {{ c.score }}<span class="text-faint">/{{ c.max }}</span>
            </span>
          </div>
          <div class="mt-2.5 h-2 overflow-hidden rounded-full bg-card-2">
            <div
              class="h-full rounded-full transition-[width] duration-700 ease-spring"
              :class="barTone(c.score, c.max)"
              :style="{ width: `${c.max ? (c.score / c.max) * 100 : 0}%` }"
            />
          </div>
          <p v-if="c.feedback" class="mt-3 text-sm leading-relaxed text-muted">{{ c.feedback }}</p>
        </div>
      </div>
    </div>

    <!-- Corrections -->
    <div v-if="corrections.length" v-reveal="{ delay: 120 }" class="rounded-card border border-line bg-card p-6 shadow-soft">
      <h3 class="mb-5 flex items-center gap-2 border-b border-line pb-3.5 font-heading text-base font-bold text-ink">
        <i class="pi pi-pencil text-sm text-primary" />
        Corrections
        <span class="ml-auto rounded-full bg-card-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
          {{ corrections.length }}
        </span>
      </h3>
      <ul class="flex flex-col gap-3">
        <li v-for="(c, i) in corrections" :key="i" class="rounded-2xl bg-canvas p-4 text-sm">
          <template v-if="correctionOriginal(c) || correctionFixed(c)">
            <div class="flex flex-wrap items-center gap-2">
              <s
                v-if="correctionOriginal(c)"
                class="rounded-lg bg-red-50 px-2 py-1 text-red-700 decoration-red-400 dark:bg-red-950 dark:text-red-300"
              >
                {{ correctionOriginal(c) }}
              </s>
              <i v-if="correctionOriginal(c) && correctionFixed(c)" class="pi pi-arrow-right text-xs text-faint" />
              <strong
                v-if="correctionFixed(c)"
                class="rounded-lg bg-green-50 px-2 py-1 font-semibold text-green-700 dark:bg-green-950 dark:text-green-300"
              >
                {{ correctionFixed(c) }}
              </strong>
            </div>
            <p v-if="correctionExplanation(c)" class="mt-2.5 leading-relaxed text-muted">
              {{ correctionExplanation(c) }}
            </p>
          </template>
          <p v-else class="leading-relaxed text-ink">{{ suggestionText(c) }}</p>
        </li>
      </ul>
    </div>

    <!-- Suggestions -->
    <div v-if="suggestions.length" v-reveal="{ delay: 160 }" class="rounded-card border border-line bg-card p-6 shadow-soft">
      <h3 class="mb-5 flex items-center gap-2 border-b border-line pb-3.5 font-heading text-base font-bold text-ink">
        <i class="pi pi-lightbulb text-sm text-accent-600" />
        Suggestions
      </h3>
      <ul class="flex flex-col gap-2.5">
        <li v-for="(s, i) in suggestions" :key="i" class="flex items-start gap-3 text-sm leading-relaxed text-muted">
          <span class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300">
            <i class="pi pi-check text-[0.55rem]" />
          </span>
          {{ suggestionText(s) }}
        </li>
      </ul>
    </div>

    <!-- Textes corrigés -->
    <div
      v-for="(task, i) in tasks"
      :key="task.taskNumber"
      v-reveal="{ delay: 200 + i * 60 }"
      class="rounded-card border border-line bg-card p-6 shadow-soft"
    >
      <h3 class="mb-5 flex items-center gap-3 border-b border-line pb-3.5 font-heading text-base font-bold text-ink">
        <span class="brand-gradient grid size-8 place-items-center rounded-[0.8rem_0.25rem] text-sm font-extrabold text-white">
          {{ task.taskNumber }}
        </span>
        Tâche {{ task.taskNumber }} : texte corrigé
      </h3>
      <p class="whitespace-pre-wrap rounded-2xl bg-canvas p-5 text-sm leading-relaxed text-ink">
        {{ task.correctedText }}
      </p>
    </div>
  </div>
</template>