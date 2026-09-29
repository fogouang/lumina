<script setup lang="ts">
import type { ExpressionTaskResponse } from "#shared/api/models/ExpressionTaskResponse";
import type { SuccessResponse_list_ExpressionTaskResponse__ } from "#shared/api/models/SuccessResponse_list_ExpressionTaskResponse__";
import type { AttemptHistoryItem } from "#shared/api/models/AttemptHistoryItem";
import { ExpressionOraleService } from "#shared/api/services/ExpressionOraleService";

definePageMeta({ layout: "account", middleware: "auth" });

const route = useRoute();
const seriesId = route.params.seriesId as string;

const { get } = useApi();

const loading = ref(true);
const error = ref<string | null>(null);
const oralTasks = ref<ExpressionTaskResponse[]>([]);
const lastAttemptByTask = ref<Record<number, AttemptHistoryItem>>({});

// Sujets dépliés (affichage complet du texte)
const expanded = ref<Record<string, boolean>>({});

// ── En-tête (affichage) ──────────────────────────────────────
const attemptedCount = computed(
  () => oralTasks.value.filter((t) => lastAttemptByTask.value[t.task_number]).length,
);

const totalMinutes = computed(() =>
  Math.round(
    oralTasks.value.reduce(
      (sum, t) => sum + (t.preparation_time_seconds ?? 0) + (t.recording_time_seconds ?? 0),
      0,
    ) / 60,
  ),
);


function toggleExpanded(id: string): void {
  expanded.value[id] = !expanded.value[id];
}

// Texte du sujet
function taskText(task: ExpressionTaskResponse): string {
  return task.instruction_text ?? "";
}

function durationLabel(task: ExpressionTaskResponse): string {
  const prep = task.preparation_time_seconds ?? 0;
  const live = task.recording_time_seconds ?? 0;
  const fmt = (s: number) => `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60}s` : ""}`;
  return prep > 0 ? `${fmt(prep)} de préparation + ${fmt(live)} d'échange` : fmt(live);
}

onMounted(async () => {
  try {
    const res = await get<SuccessResponse_list_ExpressionTaskResponse__>(
      `/v1/expression-tasks/series/${seriesId}`,
    );
    oralTasks.value = (res.data ?? [])
      .filter((t) => t.type === "oral")
      .sort((a, b) => a.task_number - b.task_number);
  } catch {
    error.value = "Impossible de charger les sujets d'Expression Orale de cette série.";
  } finally {
    loading.value = false;
  }

  try {
    const attemptsRes =
      await ExpressionOraleService.getSeriesAttemptsApiV1ExpressionOraleSeriesSeriesIdAttemptsGet(
        seriesId,
      );
    for (const attempt of attemptsRes.data ?? []) {
      if (!(attempt.task_number in lastAttemptByTask.value)) {
        lastAttemptByTask.value[attempt.task_number] = attempt;
      }
    }
  } catch {
    // Pas bloquant : l'absence d'historique n'empêche pas de démarrer une tâche.
  }
});

function lastAttemptFor(taskNumber: number): AttemptHistoryItem | undefined {
  return lastAttemptByTask.value[taskNumber];
}

function goToConversation(task: ExpressionTaskResponse): void {
  navigateTo(`/simulateur-oral/${seriesId}/${task.id}`);
}
</script>

<template>
  <div>
        <!-- En-tête -->
    <header class="featured-panel relative mb-6 overflow-hidden rounded-card p-6 text-white shadow-brand sm:p-8">
      <div class="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="min-w-0">
          <NuxtLink
            to="/simulateur-oral"
            class="mb-3 inline-flex items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-white"
          >
            <i class="pi pi-arrow-left text-xs" />
            Simulateur oral
          </NuxtLink>
          <h1 class="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            Expression Orale
          </h1>
        </div>

        <dl class="grid grid-cols-3 gap-2 sm:gap-3 lg:min-w-md">
          <div class="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur sm:px-4">
            <dt class="sr-only">Nombre de tâches</dt>
            <i class="pi pi-microphone text-sm text-accent-400" aria-hidden="true" />
            <dd class="mt-1.5 font-heading text-sm font-bold sm:text-base">
              {{ loading ? "·" : `${oralTasks.length} tâches` }}
            </dd>
          </div>
          <div class="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur sm:px-4">
            <dt class="sr-only">Tâches déjà tentées</dt>
            <i class="pi pi-history text-sm text-accent-400" aria-hidden="true" />
            <dd class="mt-1.5 font-heading text-sm font-bold sm:text-base">
              {{ loading ? "·" : `${attemptedCount}/${oralTasks.length} tentées` }}
            </dd>
          </div>
          <div class="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur sm:px-4">
            <dt class="sr-only">Durée totale</dt>
            <i class="pi pi-clock text-sm text-accent-400" aria-hidden="true" />
            <dd class="mt-1.5 font-heading text-sm font-bold sm:text-base">
              {{ loading ? "·" : `${totalMinutes} min` }}
            </dd>
          </div>
        </dl>
      </div>
    </header>

    <!-- Chargement -->
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="h-32 animate-pulse rounded-card border border-line bg-card" />
    </div>

    <!-- Erreur -->
    <div
      v-else-if="error"
      class="flex items-start gap-3 rounded-card border border-red-200 bg-red-50 p-5 dark:border-red-500/25 dark:bg-red-500/10"
    >
      <span class="grid size-10 shrink-0 place-items-center rounded-leaf bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
        <i class="pi pi-times-circle" />
      </span>
      <p class="pt-2 text-sm font-medium text-red-700 dark:text-red-300">{{ error }}</p>
    </div>

    <!-- Aucun sujet -->
    <div
      v-else-if="!oralTasks.length"
      class="flex flex-col items-center rounded-card border border-dashed border-line bg-card px-6 py-14 text-center"
    >
      <span class="mb-3 grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
        <i class="pi pi-microphone text-2xl" />
      </span>
      <p class="max-w-sm text-sm font-medium text-muted">
        Aucun sujet d'Expression Orale n'est encore disponible pour cette série.
      </p>
    </div>

    <!-- Tâches -->
    <div v-else class="space-y-3">
      <article
        v-for="task in oralTasks"
        :key="task.id"
        class="grid grid-cols-1 gap-4 rounded-card border border-line bg-card p-4 shadow-soft transition-shadow duration-300 hover:shadow-lift sm:p-5 lg:grid-cols-[15rem_1fr_auto] lg:items-center lg:gap-6"
      >
        <!-- Infos -->
        <div class="flex items-center gap-3.5 lg:self-start">
          <span class="relative grid size-12 shrink-0 place-items-center rounded-leaf brand-gradient text-white shadow-brand">
            <i class="pi pi-microphone text-lg" />
            <span
              class="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full border-2 border-card bg-accent-400 text-[0.6rem] font-extrabold text-primary-950"
            >
              {{ task.task_number }}
            </span>
          </span>
          <div class="min-w-0">
            <h2 class="truncate font-heading text-sm font-bold text-ink">
              {{ task.title ?? `Tâche ${task.task_number}` }}
            </h2>
            <p class="mt-0.5 flex items-start gap-1.5 text-xs text-muted">
              <i class="pi pi-clock mt-0.5 text-[0.65rem]" />
              {{ durationLabel(task) }}
            </p>
            <span
              v-if="lastAttemptFor(task.task_number)"
              class="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums"
              :class="
                lastAttemptFor(task.task_number)?.capped
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
              "
            >
              <i class="pi pi-history text-[0.6rem]" />
              Dernier essai : {{ lastAttemptFor(task.task_number)?.total_score }}/20{{
                lastAttemptFor(task.task_number)?.capped ? " (plafonné)" : ""
              }}
            </span>
          </div>
        </div>

        <!-- Sujet -->
        <div
          class="min-w-0 rounded-2xl border border-line bg-card-2/50 px-4 py-3 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:bg-transparent lg:py-1 lg:pl-6"
        >
          <p class="mb-1 text-[0.65rem] font-bold uppercase tracking-wider text-faint">Sujet</p>
          <template v-if="taskText(task)">
            <p
              class="whitespace-pre-line text-xl leading-relaxed text-ink lg:text-2xl"
              :class="expanded[task.id] ? '' : 'line-clamp-4'"
            >
              {{ taskText(task) }}
            </p>
            <button
              v-if="taskText(task).length > 220"
              type="button"
              class="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              :aria-expanded="!!expanded[task.id]"
              @click="toggleExpanded(task.id)"
            >
              {{ expanded[task.id] ? "Réduire" : "Lire tout le sujet" }}
              <i class="pi text-[0.6rem]" :class="expanded[task.id] ? 'pi-chevron-up' : 'pi-chevron-down'" />
            </button>
          </template>
          <p v-else class="text-sm italic text-faint">
            Le sujet vous sera présenté par l'examinateur au début de l'échange.
          </p>
        </div>

        <!-- Action -->
        <AppButton
          label="Démarrer"
          icon="pi pi-play"
          variant="gradient"
          class="w-full lg:w-auto"
          @click="goToConversation(task)"
        />
      </article>
    </div>
  </div>
</template>