<template>
  <div class="flex flex-col gap-6">
    <h1 class="account-page-title mb-0">Mes tentatives</h1>

    <div class="account-section">
      <!-- Filtres -->
      <div class="mb-6 flex flex-wrap gap-2">
        <button
          v-for="f in filters"
          :key="f.value"
          type="button"
          class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200"
          :class="
            activeFilter === f.value
              ? 'border-transparent brand-gradient text-white shadow-brand'
              : 'border-line bg-card text-muted hover:border-primary-200 hover:text-ink'
          "
          @click="activeFilter = f.value"
        >
          {{ f.label }}
          <span
            class="rounded-full px-2 py-0.5 text-xs"
            :class="activeFilter === f.value ? 'bg-white/20 text-white' : 'bg-card-2 text-faint'"
          >
            {{ filterCount(f.value) }}
          </span>
        </button>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="flex flex-col gap-3">
        <Skeleton v-for="n in 3" :key="n" height="5rem" border-radius="1rem" />
      </div>

      <!-- Vide -->
      <div v-else-if="!filteredGroups.length" class="flex flex-col items-center gap-3 py-12 text-center">
        <span class="grid size-14 place-items-center rounded-leaf bg-card-2 text-faint">
          <i class="pi pi-inbox text-xl" />
        </span>
        <p class="font-semibold text-ink">Aucune tentative trouvée</p>
        <AppCta
          to="/epreuve/comprehension-ecrite/series"
          label="Commencer un test"
          icon="pi pi-play"
          icon-pos="left"
          size="md"
        />
      </div>

      <!-- Groupes par série -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="group in filteredGroups"
          :key="group.seriesId"
          class="overflow-hidden rounded-2xl border transition-all duration-300 ease-spring"
          :class="
            expandedGroups.includes(group.seriesId)
              ? 'border-primary-200 bg-card shadow-lift dark:border-primary-800'
              : 'border-line bg-canvas hover:border-primary-200 dark:hover:border-primary-800'
          "
        >
          <!-- En-tête série -->
          <button
            type="button"
            class="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
            :aria-expanded="expandedGroups.includes(group.seriesId)"
            @click="toggleGroup(group.seriesId)"
          >
            <div class="flex items-center gap-4">
              <span class="grid size-11 shrink-0 place-items-center rounded-leaf bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                <i class="pi pi-book" />
              </span>
              <div>
                <p class="font-heading font-bold text-ink">Série {{ group.seriesNumber ?? "—" }}</p>
                <p class="mt-0.5 text-sm text-faint">
                  {{ group.attempts.length }} tentative{{ group.attempts.length > 1 ? "s" : "" }}
                  <template v-if="group.bestScore !== null">
                    · Meilleur score :
                    <strong class="font-semibold text-ink">{{ group.bestScore }}/699</strong>
                  </template>
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 self-end sm:self-auto">
              <span
                v-if="group.attempts.length > 1 && group.progressDelta !== null"
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                :class="
                  group.progressDelta >= 0
                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                "
              >
                <i :class="[group.progressDelta >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down', 'text-[0.6rem]']" />
                {{ Math.abs(group.progressDelta) }} pts
              </span>
              <Tag
                :value="statusLabel(group.latestStatus)"
                :severity="statusSeverity(group.latestStatus)"
                rounded
              />
              <i
                class="pi pi-angle-down text-faint transition-transform duration-300 ease-spring"
                :class="expandedGroups.includes(group.seriesId) ? 'rotate-180' : ''"
              />
            </div>
          </button>

          <!-- Tentatives -->
          <div v-if="expandedGroups.includes(group.seriesId)" class="border-t border-line bg-canvas/60 p-2">
            <div
              v-for="(attempt, idx) in group.attempts"
              :key="attempt.id"
              class="flex flex-col gap-3 rounded-xl p-3 transition-colors hover:bg-card sm:flex-row sm:items-center"
            >
              <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-card-2 font-heading text-xs font-bold text-muted">
                T{{ group.attempts.length - idx }}
              </span>

              <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-sm text-faint">
                <Tag :value="statusLabel(attempt.status)" :severity="statusSeverity(attempt.status)" rounded />
                <span v-if="attempt.oral_score || attempt.written_score" class="font-heading font-bold text-ink">
                  {{ (attempt.oral_score ?? 0) + (attempt.written_score ?? 0) }}/699
                </span>
                <span class="inline-flex items-center gap-1">
                  <i class="pi pi-calendar text-[0.7rem]" />
                  {{ formatDate(attempt.started_at) }}
                </span>
                <span v-if="attempt.completed_at" class="inline-flex items-center gap-1">
                  <i class="pi pi-clock text-[0.7rem]" />
                  {{ duration(attempt.started_at, attempt.completed_at) }}
                </span>
              </div>

              <div class="shrink-0">
                <AppCta
                  v-if="attempt.status === 'completed'"
                  :to="`/epreuve/comprehension-ecrite/resultats/${attempt.id}`"
                  label="Résultats"
                  icon="pi pi-chart-bar"
                  icon-pos="left"
                  variant="outline"
                  size="md"
                />
                <AppCta
                  v-else-if="attempt.status === 'in_progress'"
                  :to="`/epreuve/comprehension-ecrite/series/${attempt.series_id}`"
                  label="Continuer"
                  icon="pi pi-play"
                  icon-pos="left"
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="account-section">
      <ExpressionOraleHistory />
    </div>

    <div class="account-section">
      <ExpressionecriteHistory />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamAttemptResponse } from "#shared/api/models/ExamAttemptResponse";
import type { SuccessResponse_list_ExamAttemptResponse__ } from "#shared/api/models/SuccessResponse_list_ExamAttemptResponse__";
import { site } from "~/config/site";

definePageMeta({ layout: "account", middleware: "auth" });

const { get } = useApi();
const loading = ref(true);
const attempts = ref<ExamAttemptResponse[]>([]);
const expandedGroups = ref<string[]>([]);
const activeFilter = ref<"all" | "completed" | "in_progress" | "abandoned">("all");

onMounted(async () => {
  try {
    const res = await get<SuccessResponse_list_ExamAttemptResponse__>("/v1/exam-attempts");
    attempts.value = (res.data ?? []).sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    );
    // Déplie le premier groupe par défaut
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
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    );
    const scores = sorted
      .filter((a) => a.status === "completed")
      .map((a) => (a.oral_score ?? 0) + (a.written_score ?? 0));

    const bestScore = scores.length ? Math.max(...scores) : null;
    const latestScore = scores[0] ?? null;
    const previousScore = scores[1] ?? null;
    const progressDelta =
      latestScore !== null && previousScore !== null ? latestScore - previousScore : null;

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
  return groups.value.filter((g) => g.attempts.some((a) => a.status === value)).length;
}

const filteredGroups = computed(() => {
  if (activeFilter.value === "all") return groups.value;
  return groups.value.filter((g) => g.attempts.some((a) => a.status === activeFilter.value));
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
  return { in_progress: "En cours", completed: "Terminé", abandoned: "Abandonné" }[s] ?? s;
}
function statusSeverity(s: string) {
  return { in_progress: "warning", completed: "success", abandoned: "danger" }[s] ?? "secondary";
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function duration(start: string, end: string): string {
  const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}min ${s}s`;
}

useHead({ title: `Mes tentatives | ${site.name}` });
</script>