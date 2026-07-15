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

    <div class="account-section">
      <div v-if="loading" style="display: flex; justify-content: center; padding: 3rem">
        <ProgressSpinner style="width: 40px; height: 40px" />
      </div>
      <Message v-else-if="error" severity="error">{{ error }}</Message>

      <div v-else class="eo-task-grid">
        <div
          v-for="task in oralTasks"
          :key="task.id"
          class="eo-task-card"
          @click="goToConversation(task)"
        >
          <div class="eo-task-card__icon">
            <i class="pi pi-microphone" />
          </div>

          <div class="eo-task-card__body">
            <span class="eo-task-card__title">{{ task.title ?? `Tâche ${task.task_number}` }}</span>
            <span class="eo-task-card__sub">{{ durationLabel(task) }}</span>
            <span
              v-if="lastAttemptFor(task.task_number)"
              class="eo-task-card__last-attempt"
              :class="lastAttemptFor(task.task_number)?.capped ? 'eo-task-card__last-attempt--capped' : ''"
            >
              Dernier essai : {{ lastAttemptFor(task.task_number)?.total_score }}/20{{
                lastAttemptFor(task.task_number)?.capped ? " (plafonné)" : ""
              }}
            </span>
          </div>

          <div class="eo-task-card__cta">
            <Button
              label="Démarrer"
              size="small"
              class="bg-gradient-primary border-none"
              @click.stop="goToConversation(task)"
            />
          </div>
        </div>

        <Message v-if="!oralTasks.length" severity="info">
          Aucun sujet d'Expression Orale n'est encore disponible pour cette série.
        </Message>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eo-task-grid {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.eo-task-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.eo-task-card:hover {
  border-color: var(--color-primary-300);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
}

.eo-task-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--color-primary-50);
}

.eo-task-card__icon i {
  color: var(--color-primary-600);
  font-size: 1rem;
}

.eo-task-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.eo-task-card__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.eo-task-card__sub {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.eo-task-card__last-attempt {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary-600);
  margin-top: 0.125rem;
}

.eo-task-card__last-attempt--capped {
  color: #b45309;
}

.eo-task-card__cta :deep(.p-button) {
  border: none !important;
  border-radius: 0.5rem !important;
  font-size: 0.8125rem !important;
  font-weight: 600 !important;
  white-space: nowrap;
}
</style>