<script setup lang="ts">
const PAGE_SIZE = 20;

interface WrittenAttemptHistoryItem {
  attempt_id: string;
  series_id: string | null;
  overall_score: number;
  cecrl_level: string;
  created_at: string;
}

const { get } = useApi();

const loading = ref(true);
const loadingMore = ref(false);
const error = ref<string | null>(null);
const attempts = ref<WrittenAttemptHistoryItem[]>([]);
const total = ref(0);
const offset = ref(0);

const hasMore = computed(() => attempts.value.length < total.value);

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
  const res = await get<{ data: { items: WrittenAttemptHistoryItem[]; total: number } }>(
    "/v1/public-expressions/ee/history",
    { params: { limit: PAGE_SIZE, offset: offset.value } },
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
    error.value = "Impossible de charger l'historique Expression Écrite.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="ee-history">
    <h2 class="ee-history__title">Expression Écrite</h2>

    <div v-if="loading" class="ee-history__loading">Chargement…</div>
    <Message v-else-if="error" severity="error">{{ error }}</Message>

    <template v-else>
      <Message v-if="!attempts.length" severity="info">
        Aucune tentative d'Expression Écrite enregistrée pour le moment.
      </Message>

      <div v-else class="ee-history__list">
        <div v-for="attempt in attempts" :key="attempt.attempt_id" class="ee-history__row">
          <div class="ee-history__row-main">
            <span class="ee-history__level">Niveau {{ attempt.cecrl_level }}</span>
            <span class="ee-history__date">{{ formatDate(attempt.created_at) }}</span>
          </div>
          <Tag severity="success" :value="`${attempt.overall_score}/20`" />
        </div>
      </div>

      <Button
        v-if="hasMore"
        label="Charger plus"
        text
        :loading="loadingMore"
        class="ee-history__load-more"
        @click="loadMore"
      />
    </template>
  </div>
</template>

<style scoped>
.ee-history__title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.ee-history__list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.ee-history__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
}
.ee-history__row-main {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}
.ee-history__level {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}
.ee-history__date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}
.ee-history__load-more {
  margin-top: 0.75rem;
  align-self: center;
}
</style>