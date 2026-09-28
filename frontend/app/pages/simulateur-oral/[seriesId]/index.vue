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
    <h1 class="account-page-title">Simulateur Expression Orale</h1>

    <!-- Chargement -->
    <div v-if="loading" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="n in 3" :key="n" class="h-28 animate-pulse rounded-card border border-line bg-card" />
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
    <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="task in oralTasks"
        :key="task.id"
        type="button"
        class="group flex items-center gap-4 rounded-card border border-line bg-card p-4 text-left shadow-soft transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        @click="goToConversation(task)"
      >
        <span class="relative grid size-12 shrink-0 place-items-center rounded-leaf brand-gradient text-white shadow-brand">
          <i class="pi pi-microphone text-lg" />
          <span
            class="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full border-2 border-card bg-accent-400 text-[0.6rem] font-extrabold text-primary-950"
          >
            {{ task.task_number }}
          </span>
        </span>

        <span class="min-w-0 flex-1">
          <span class="block truncate font-heading text-sm font-bold text-ink">
            {{ task.title ?? `Tâche ${task.task_number}` }}
          </span>
          <span class="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <i class="pi pi-clock text-[0.65rem]" />
            {{ durationLabel(task) }}
          </span>
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
        </span>

        <span
          class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-contrast"
        >
          <i class="pi pi-play text-[0.6rem]" />
          Démarrer
        </span>
      </button>
    </div>
  </div>
</template>

