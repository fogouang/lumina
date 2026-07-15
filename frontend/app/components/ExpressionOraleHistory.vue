<script setup lang="ts">
import type { AttemptHistoryItem } from "#shared/api/models/AttemptHistoryItem";
import { ExpressionOraleService } from "#shared/api/services/ExpressionOraleService";

const PAGE_SIZE = 20;

const loading = ref(true);
const loadingMore = ref(false);
const error = ref<string | null>(null);
const attempts = ref<AttemptHistoryItem[]>([]);
const total = ref(0);
const offset = ref(0);

const hasMore = computed(() => attempts.value.length < total.value);

const TASK_LABEL: Record<number, string> = {
  1: "Tâche 1 - Entretien dirigé",
  2: "Tâche 2 - Interaction",
  3: "Tâche 3 - Point de vue",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function fetchPage(): Promise<void> {
  const res = await ExpressionOraleService.getExpressionOraleHistoryApiV1ExpressionOraleHistoryGet(
    PAGE_SIZE,
    offset.value,
  );
  attempts.value.push(...(res.data?.items ?? []));
  total.value = res.data?.total ?? 0;
  offset.value += PAGE_SIZE;
}

async function loadMore(): Promise<void> {
  loadingMore.value = true;
  try {
    await fetchPage();
  } catch {
    error.value = "Impossible de charger la suite de l'historique.";
  } finally {
    loadingMore.value = false;
  }
}

onMounted(async () => {
  try {
    await fetchPage();
  } catch {
    error.value = "Impossible de charger l'historique Expression Orale.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="eo-history">
    <h2 class="eo-history__title">Expression Orale</h2>

    <div v-if="loading" class="eo-history__loading">Chargement…</div>
    <Message v-else-if="error" severity="error">{{ error }}</Message>

    <template v-else>
      <Message v-if="!attempts.length" severity="info">
        Aucune tentative d'Expression Orale enregistrée pour le moment.
      </Message>

      <div v-else class="eo-history__list">
        <div v-for="attempt in attempts" :key="attempt.attempt_id" class="eo-history__row">
          <div class="eo-history__row-main">
            <span class="eo-history__task">{{ TASK_LABEL[attempt.task_number] ?? `Tâche ${attempt.task_number}` }}</span>
            <span class="eo-history__date">{{ formatDate(attempt.completed_at) }}</span>
          </div>
          <Tag
            :severity="attempt.capped ? 'warn' : 'success'"
            :value="`${attempt.total_score}/20${attempt.capped ? ' (plafonné)' : ''}`"
          />
        </div>
      </div>

      <Button
        v-if="hasMore"
        label="Charger plus"
        text
        :loading="loadingMore"
        class="eo-history__load-more"
        @click="loadMore"
      />
    </template>
  </div>
</template>

<style scoped>
.eo-history__title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.eo-history__list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.eo-history__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
}
.eo-history__row-main {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}
.eo-history__task {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}
.eo-history__date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}
.eo-history__load-more {
  margin-top: 0.75rem;
  align-self: center;
}
</style>