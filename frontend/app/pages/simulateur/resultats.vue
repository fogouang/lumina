<script setup lang="ts">
interface WrittenExpressionResponse {
  id: string;
  attempt_id: string;
  task_id: string;
  text_content: string;
  word_count: number;
  submitted_at: string;
  correction_status: string;
}

interface AICorrectionResponse {
  id: string;
  expression_id: string;
  corrected_text: string;
  structure_score: number | null;
  structure_feedback: string | null;
  cohesion_score: number | null;
  cohesion_feedback: string | null;
  vocabulary_score: number | null;
  vocabulary_feedback: string | null;
  grammar_score: number | null;
  grammar_feedback: string | null;
  task_score: number | null;
  task_feedback: string | null;
  overall_score: number | null;
  cecrl_level: string | null;
  appreciation: string | null;
  corrections_json: { corrections: unknown[] } | null;
  suggestions_json: { suggestions: unknown[] } | null;
}

const route = useRoute();
const attemptId = route.params.attemptId as string;

const { get } = useApi();

const loading = ref(true);
const error = ref<string | null>(null);
const expressions = ref<WrittenExpressionResponse[]>([]);
const corrections = ref<(AICorrectionResponse | null)[]>([]);

onMounted(async () => {
  try {
    const expressionsRes = await get<{ data: WrittenExpressionResponse[] }>(
      `/v1/written-expressions/attempts/${attemptId}`,
    );
    expressions.value = expressionsRes.data ?? [];

    if (expressions.value.length !== 3) {
      error.value =
        "Les 3 tâches n'ont pas toutes été soumises pour cette tentative.";
      return;
    }

    // Une correction par expression — les 3 partagent les mêmes critères/score
    // global (correction combinée côté back), seul corrected_text diffère.
    const results = await Promise.all(
      expressions.value.map((expr) =>
        get<{ data: AICorrectionResponse | null }>(
          `/v1/written-expressions/${expr.id}/ai-correction`,
        ).then((r) => r.data ?? null),
      ),
    );
    corrections.value = results;

    if (results.some((c) => c === null)) {
      error.value =
        "La correction IA n'est pas encore disponible pour cette tentative.";
    }
  } catch {
    error.value = "Impossible de charger les résultats de cette tentative.";
  } finally {
    loading.value = false;
  }
});

// Les 3 corrections partagent les mêmes critères — on prend la première
// disponible comme référence pour le score global/critères.
const reference = computed(
  () => corrections.value.find((c) => c !== null) ?? null,
);

const criteria = computed(() => {
  const c = reference.value;
  if (!c) return [];
  return [
    {
      name: "Structure",
      score: c.structure_score ?? 0,
      max: 5,
      feedback: c.structure_feedback ?? "",
    },
    {
      name: "Cohésion",
      score: c.cohesion_score ?? 0,
      max: 4,
      feedback: c.cohesion_feedback ?? "",
    },
    {
      name: "Vocabulaire",
      score: c.vocabulary_score ?? 0,
      max: 4,
      feedback: c.vocabulary_feedback ?? "",
    },
    {
      name: "Grammaire",
      score: c.grammar_score ?? 0,
      max: 3,
      feedback: c.grammar_feedback ?? "",
    },
    {
      name: "Réalisation de la tâche",
      score: c.task_score ?? 0,
      max: 4,
      feedback: c.task_feedback ?? "",
    },
  ];
});

// TODO: WrittenExpressionResponse n'expose pas task_number directement —
// on suppose que get_my_expressions/attempts renvoie déjà dans l'ordre des
// tâches (1,2,3), à confirmer côté back. À ajuster si l'ordre n'est pas garanti.
const tasks = computed(() =>
  corrections.value.map((c, i) => ({
    taskNumber: i + 1,
    correctedText: c?.corrected_text ?? "",
  })),
);

const allCorrections = computed(
  () => reference.value?.corrections_json?.corrections ?? [],
);
const allSuggestions = computed(
  () => reference.value?.suggestions_json?.suggestions ?? [],
);
</script>

<template>
  <div class="mx-auto w-full max-w-4xl">
    <!-- Chargement -->
    <div v-if="loading" class="space-y-4">
      <div class="h-56 animate-pulse rounded-card bg-card" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 3" :key="n" class="h-28 animate-pulse rounded-card bg-card" />
      </div>
      <div class="h-64 animate-pulse rounded-card bg-card" />
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

    <!-- Résultat -->
    <WrittenExpressionResult
      v-else-if="reference"
      :overall-score="reference.overall_score ?? 0"
      :cecrl-level="reference.cecrl_level ?? '—'"
      :appreciation="reference.appreciation ?? ''"
      :criteria="criteria"
      :tasks="tasks"
      :corrections="allCorrections"
      :suggestions="allSuggestions"
    />
  </div>
</template>
