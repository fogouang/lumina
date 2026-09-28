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

// Couleur de la note /20 (affichage uniquement)
function scoreTone(score: number): string {
  if (score >= 14) return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
  if (score >= 10) return "bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300";
  return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
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
  <div>
    <!-- En-tête -->
    <div class="mb-5 flex items-center justify-between gap-3 border-b border-line pb-3.5">
      <div class="flex items-center gap-3">
        <span class="grid size-9 place-items-center rounded-leaf bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
          <i class="pi pi-pen-to-square text-sm" />
        </span>
        <h2 class="font-heading text-base font-bold text-ink">Expression écrite</h2>
      </div>
      <span v-if="!loading && total" class="rounded-full bg-card-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
        {{ total }} tentative{{ total > 1 ? "s" : "" }}
      </span>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="flex flex-col gap-2">
      <Skeleton v-for="n in 3" :key="n" height="3.75rem" border-radius="1rem" />
    </div>

    <!-- Erreur -->
    <div
      v-else-if="error && !attempts.length"
      class="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950"
    >
      <i class="pi pi-exclamation-circle mt-0.5 text-red-600 dark:text-red-400" />
      <p class="text-sm font-medium text-red-700 dark:text-red-300">{{ error }}</p>
    </div>

    <template v-else>
      <!-- Vide -->
      <div v-if="!attempts.length" class="flex flex-col items-center gap-3 py-8 text-center">
        <span class="grid size-12 place-items-center rounded-leaf bg-card-2 text-faint">
          <i class="pi pi-inbox text-lg" />
        </span>
        <p class="text-sm text-muted">Aucune tentative d'expression écrite enregistrée pour le moment.</p>
      </div>

      <!-- Liste -->
      <div v-else class="flex flex-col gap-1">
        <div
          v-for="attempt in attempts"
          :key="attempt.attempt_id"
          class="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-card-2"
        >
          <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-card-2 font-heading text-xs font-bold text-primary">
            {{ attempt.cecrl_level }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-ink">Niveau {{ attempt.cecrl_level }}</p>
            <p class="mt-0.5 inline-flex items-center gap-1 text-xs text-faint">
              <i class="pi pi-calendar text-[0.65rem]" />
              {{ formatDate(attempt.created_at) }}
            </p>
          </div>
          <span
            class="shrink-0 rounded-full px-3 py-1 font-heading text-sm font-bold"
            :class="scoreTone(attempt.overall_score)"
          >
            {{ attempt.overall_score }}/20
          </span>
        </div>
      </div>

      <!-- Erreur au chargement de la suite -->
      <p v-if="error && attempts.length" class="mt-3 text-center text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </p>

      <AppButton
        v-if="hasMore"
        label="Charger plus"
        icon="pi pi-angle-down"
        variant="ghost"
        block
        :loading="loadingMore"
        class="mt-3"
        @click="loadMore"
      />
    </template>
  </div>
</template>