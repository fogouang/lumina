<template>
  <div>
    <h1 class="account-page-title">Mes tentatives</h1>

    <div class="account-section">
      <!-- Filtres -->
      <div class="tentatives__filters">
        <button
          v-for="f in filters"
          :key="f.value"
          class="tentatives__filter"
          :class="{ 'tentatives__filter--active': activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
          <span class="tentatives__filter-count">{{
            filterCount(f.value)
          }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        style="display: flex; justify-content: center; padding: 3rem"
      >
        <ProgressSpinner style="width: 40px; height: 40px" />
      </div>

      <!-- Vide -->
      <div v-else-if="!filteredGroups.length" class="tentatives__empty">
        <i class="pi pi-inbox" />
        <p>Aucune tentative trouvée.</p>
      </div>

      <!-- Groupes par série -->
      <div v-else class="tentatives__groups">
        <div
          v-for="group in filteredGroups"
          :key="group.seriesId"
          class="serie-group"
        >
          <!-- Header série -->
          <div class="serie-group__header" @click="toggleGroup(group.seriesId)">
            <div class="serie-group__left">
              <div class="serie-group__icon">
                <i class="pi pi-book" />
              </div>
              <div>
                <p class="serie-group__title">
                  Série {{ group.seriesNumber ?? "—" }}
                </p>
                <p class="serie-group__sub">
                  {{ group.attempts.length }} tentative{{
                    group.attempts.length > 1 ? "s" : ""
                  }}
                  <span
                    v-if="group.bestScore !== null"
                    class="serie-group__best"
                  >
                    · Meilleur score :
                    <strong>{{ group.bestScore }}/699</strong>
                  </span>
                </p>
              </div>
            </div>
            <div class="serie-group__right">
              <!-- Progression -->
              <div
                v-if="group.attempts.length > 1 && group.progressDelta !== null"
                class="serie-group__progress"
              >
                <span
                  :class="
                    group.progressDelta >= 0 ? 'progress--up' : 'progress--down'
                  "
                >
                  <i
                    :class="
                      group.progressDelta >= 0
                        ? 'pi pi-arrow-up'
                        : 'pi pi-arrow-down'
                    "
                  />
                  {{ Math.abs(group.progressDelta) }} pts
                </span>
              </div>
              <Tag
                :value="statusLabel(group.latestStatus)"
                :severity="statusSeverity(group.latestStatus)"
              />
              <i
                :class="
                  expandedGroups.includes(group.seriesId)
                    ? 'pi pi-angle-up'
                    : 'pi pi-angle-down'
                "
                class="text-(--text-tertiary)"
              />
            </div>
          </div>

          <!-- Tentatives -->
          <div
            v-if="expandedGroups.includes(group.seriesId)"
            class="serie-group__attempts"
          >
            <div
              v-for="(attempt, idx) in group.attempts"
              :key="attempt.id"
              class="tentative-row"
            >
              <div class="tentative-row__num">
                <span>T{{ group.attempts.length - idx }}</span>
              </div>

              <div class="tentative-row__body">
                <div class="tentative-row__meta">
                  <Tag
                    :value="statusLabel(attempt.status)"
                    :severity="statusSeverity(attempt.status)"
                  />
                  <span
                    v-if="attempt.oral_score || attempt.written_score"
                    class="tentative-row__score"
                  >
                    {{
                      (attempt.oral_score ?? 0) + (attempt.written_score ?? 0)
                    }}/699
                  </span>
                  <span class="tentative-row__date">{{
                    formatDate(attempt.started_at)
                  }}</span>
                  <span
                    v-if="attempt.completed_at"
                    class="tentative-row__duration"
                  >
                    {{ duration(attempt.started_at, attempt.completed_at) }}
                  </span>
                </div>
              </div>

              <div class="tentative-row__actions">
                <NuxtLink
                  v-if="attempt.status === 'completed'"
                  :to="`/epreuve/comprehension-ecrite/resultats/${attempt.id}`"
                >
                  <Button
                    label="Résultats"
                    icon="pi pi-chart-bar"
                    size="small"
                    outlined
                  />
                </NuxtLink>
                <NuxtLink
                  v-else-if="attempt.status === 'in_progress'"
                  :to="`/epreuve/comprehension-ecrite/series/${attempt.series_id}`"
                >
                  <Button
                    label="Continuer"
                    icon="pi pi-play"
                    size="small"
                    class="bg-gradient-primary border-none"
                  />
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamAttemptResponse } from "#shared/api/models/ExamAttemptResponse";
import type { SuccessResponse_list_ExamAttemptResponse__ } from "#shared/api/models/SuccessResponse_list_ExamAttemptResponse__";

definePageMeta({ layout: "account", middleware: "auth" });

const { get } = useApi();
const loading = ref(true);
const attempts = ref<ExamAttemptResponse[]>([]);
const expandedGroups = ref<string[]>([]);
const activeFilter = ref<"all" | "completed" | "in_progress" | "abandoned">(
  "all",
);

onMounted(async () => {
  try {
    const res =
      await get<SuccessResponse_list_ExamAttemptResponse__>(
        "/v1/exam-attempts",
      );
    attempts.value = (res.data ?? []).sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    );
    // Expand le premier groupe par défaut
    const firstGroup = groups.value[0];
    if (firstGroup) expandedGroups.value = [firstGroup.seriesId];
  } finally {
    loading.value = false;
  }
});

// ── Groupement par série ───────────────────────────────────────
const groups = computed(() => {
  const map = new Map<string, ExamAttemptResponse[]>();
  for (const a of attempts.value) {
    const key = a.series_id;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }

  return Array.from(map.entries()).map(([seriesId, list]) => {
    const sorted = [...list].sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    );
    const scores = sorted
      .filter((a) => a.status === "completed")
      .map((a) => (a.oral_score ?? 0) + (a.written_score ?? 0));

    const bestScore = scores.length ? Math.max(...scores) : null;
    const latestScore = scores[0] ?? null;
    const previousScore = scores[1] ?? null;
    const progressDelta =
      latestScore !== null && previousScore !== null
        ? latestScore - previousScore
        : null;

    return {
      seriesId,
      seriesNumber: sorted[0]?.series_number ?? null,
      attempts: sorted,
      latestStatus: sorted[0]?.status ?? "abandoned",
      bestScore,
      progressDelta,
    };
  });
});

// ── Filtres ───────────────────────────────────────────────────
const filters: {
  label: string;
  value: "all" | "completed" | "in_progress" | "abandoned";
}[] = [
  { label: "Toutes", value: "all" },
  { label: "Terminées", value: "completed" },
  { label: "En cours", value: "in_progress" },
  { label: "Abandonnées", value: "abandoned" },
];

function filterCount(value: string): number {
  if (value === "all") return groups.value.length;
  return groups.value.filter((g) => g.attempts.some((a) => a.status === value))
    .length;
}

const filteredGroups = computed(() => {
  if (activeFilter.value === "all") return groups.value;
  return groups.value.filter((g) =>
    g.attempts.some((a) => a.status === activeFilter.value),
  );
});

function toggleGroup(id: string) {
  if (expandedGroups.value.includes(id)) {
    expandedGroups.value = expandedGroups.value.filter((i) => i !== id);
  } else {
    expandedGroups.value.push(id);
  }
}

// ── Helpers ───────────────────────────────────────────────────
function statusLabel(s: string) {
  return (
    { in_progress: "En cours", completed: "Terminé", abandoned: "Abandonné" }[
      s
    ] ?? s
  );
}
function statusSeverity(s: string) {
  return (
    { in_progress: "warning", completed: "success", abandoned: "danger" }[s] ??
    "secondary"
  );
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function duration(start: string, end: string): string {
  const diff = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 1000,
  );
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}min ${s}s`;
}

useHead({ title: "Mes tentatives | Lumina TCF" });
</script>

<style scoped>
.tentatives__filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.tentatives__filter {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tentatives__filter:hover {
  border-color: var(--color-primary-400);
  color: var(--color-primary-600);
}
.tentatives__filter--active {
  background: var(--gradient-primary);
  border-color: transparent;
  color: #ffffff;
  font-weight: 600;
}
.tentatives__filter-count {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 9999px;
  padding: 1px 7px;
  font-size: 0.75rem;
  font-weight: 700;
}
.tentatives__filter--active .tentatives__filter-count {
  background: rgba(255, 255, 255, 0.25);
}

.tentatives__empty {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 0;
  color: var(--text-tertiary);
}
.tentatives__empty i {
  font-size: 1.5rem;
}

/* ── Groupes ──────────────────────────────────────────────── */
.tentatives__groups {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.serie-group {
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  overflow: hidden;
  background: var(--bg-card);
}

.serie-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.15s;
  gap: 1rem;
}

.serie-group__header:hover {
  background: var(--bg-ground);
}

.serie-group__left {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.serie-group__icon {
  width: 40px;
  height: 40px;
  border-radius: 0.625rem;
  background: var(--color-primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.serie-group__icon i {
  color: var(--color-primary-600);
  font-size: 1rem;
}

.serie-group__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.125rem;
}
.serie-group__sub {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0;
}
.serie-group__best {
  color: var(--color-primary-600);
}

.serie-group__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.serie-group__progress {
  font-size: 0.8125rem;
  font-weight: 700;
}
.progress--up {
  color: #16a34a;
}
.progress--down {
  color: #dc2626;
}

/* ── Tentatives ───────────────────────────────────────────── */
.serie-group__attempts {
  border-top: 1px solid var(--border-color);
  background: var(--bg-ground);
}

.tentative-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
}

.tentative-row:last-child {
  border-bottom: none;
}

.tentative-row__num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.tentative-row__body {
  flex: 1;
  min-width: 0;
}
.tentative-row__meta {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}
.tentative-row__score {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-primary-600);
}
.tentative-row__date,
.tentative-row__duration {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}
.tentative-row__actions {
  flex-shrink: 0;
}
</style>
