<template>
  <div v-if="attempt" class="min-h-screen bg-canvas">
    <!-- Hero -->
    <section class="featured-panel px-4 pb-32 pt-32 sm:px-6 lg:pt-40">
      <div
        class="bg-grid animate-grid-drift pointer-events-none absolute inset-0"
        style="--app-line: rgba(255, 255, 255, 0.06)"
      />
      <div class="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <span
          v-reveal
          class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
        >
          <i class="pi pi-check-circle text-green-300" />
          Série {{ attempt.series_number }} · {{ fromModule ? moduleLabels[fromModule] : "Série complète" }} · Terminée
        </span>

        <div v-reveal="{ from: 'zoom', delay: 100 }" class="mt-8 flex items-center gap-6 sm:gap-10">
          <div class="flex flex-col items-center">
            <span class="text-xs font-semibold uppercase tracking-widest text-white/60">Niveau</span>
            <span class="mt-1 grid size-24 place-items-center rounded-leaf bg-accent-400 font-heading text-5xl font-extrabold text-accent-950 shadow-lift">
              {{ mainLevel }}
            </span>
            <span class="mt-2 text-sm font-semibold text-white/80">NCLC {{ mainLevel }}</span>
          </div>
          <div class="h-24 w-px bg-white/20" />
          <div class="flex flex-col items-center">
            <span class="text-xs font-semibold uppercase tracking-widest text-white/60">Score</span>
            <p class="mt-1 font-heading text-6xl font-extrabold leading-none text-white">
              {{ mainScore }}<span class="text-2xl text-white/60">/699</span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <div class="relative z-10 mx-auto -mt-16 max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
      <!-- Statistiques -->
      <div v-reveal="{ delay: 200 }" class="grid grid-cols-3 gap-3 sm:gap-4">
        <div class="flex flex-col items-center gap-1 rounded-card border border-line bg-card p-4 text-center shadow-lift sm:p-5">
          <i class="pi pi-check-circle text-lg text-green-600 dark:text-green-400" />
          <span class="font-heading text-2xl font-extrabold text-ink">{{ correctCount }}</span>
          <span class="text-xs text-muted">Correctes</span>
        </div>
        <div class="flex flex-col items-center gap-1 rounded-card border border-line bg-card p-4 text-center shadow-lift sm:p-5">
          <i class="pi pi-times-circle text-lg text-red-600 dark:text-red-400" />
          <span class="font-heading text-2xl font-extrabold text-ink">{{ incorrectCount }}</span>
          <span class="text-xs text-muted">Incorrectes</span>
        </div>
        <div class="flex flex-col items-center gap-1 rounded-card border border-line bg-card p-4 text-center shadow-lift sm:p-5">
          <i class="pi pi-clock text-lg text-accent-600" />
          <span class="font-heading text-2xl font-extrabold text-ink">{{ timeSpent }}</span>
          <span class="text-xs text-muted">Temps passé</span>
        </div>
      </div>

      <!-- Aperçu -->
      <div v-reveal="{ delay: 250 }" class="mt-6 rounded-card border border-line bg-card p-6 shadow-soft">
        <h2 class="mb-5 border-b border-line pb-3.5 font-heading text-base font-bold text-ink">Aperçu des réponses</h2>
        <div class="grid grid-cols-8 gap-1.5 sm:grid-cols-10 md:grid-cols-13">
          <button
            v-for="(ans, idx) in answersFiltered"
            :key="idx"
            type="button"
            :title="`Question ${idx + 1}`"
            class="grid aspect-square place-items-center rounded-lg text-xs font-bold transition-transform duration-200 hover:scale-110"
            :class="
              ans.is_correct
                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
            "
            @click="scrollToQuestion(idx)"
          >
            {{ idx + 1 }}
          </button>
        </div>
        <div class="mt-4 flex gap-4 border-t border-line pt-3 text-xs text-muted">
          <span class="inline-flex items-center gap-1.5">
            <span class="size-3 rounded bg-green-400" />
            Correcte
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="size-3 rounded bg-red-400" />
            Incorrecte
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <AppCta
          :to="backLink"
          :label="fromSeriesId ? 'Autres modules' : 'Retour aux séries'"
          icon="pi pi-arrow-left"
          icon-pos="left"
          variant="outline"
          size="md"
        />
        <AppCta
          :to="`/epreuve/${slug}/series/${attempt.series_id}`"
          :label="fromSeriesId ? 'Refaire ce module' : 'Refaire cette série'"
          icon="pi pi-refresh"
          icon-pos="left"
          size="md"
        />
      </div>

      <!-- Correction détaillée -->
      <div class="mt-12">
        <h2 class="mb-5 font-heading text-2xl font-extrabold tracking-tight text-ink">Correction détaillée</h2>

        <div class="flex flex-col gap-5">
          <article
            v-for="(question, idx) in questionsFiltered"
            :id="`question-${idx}`"
            :key="question.id"
            class="scroll-mt-28 overflow-hidden rounded-card border bg-card shadow-soft"
            :class="
              answersMap[question.id]?.is_correct
                ? 'border-green-200 dark:border-green-900'
                : 'border-red-200 dark:border-red-900'
            "
          >
            <!-- En-tête -->
            <div
              class="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5"
              :class="
                answersMap[question.id]?.is_correct
                  ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
                  : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
              "
            >
              <div class="flex items-center gap-3">
                <span
                  class="grid size-8 place-items-center rounded-full text-white"
                  :class="answersMap[question.id]?.is_correct ? 'bg-green-500' : 'bg-red-500'"
                >
                  <i :class="[answersMap[question.id]?.is_correct ? 'pi pi-check' : 'pi pi-times', 'text-xs']" />
                </span>
                <div>
                  <p class="font-heading text-sm font-bold text-ink">Question {{ question.question_number }}</p>
                  <p class="text-xs text-muted">
                    {{ question.type === "oral" ? "Compréhension orale" : "Compréhension écrite" }}
                  </p>
                </div>
              </div>
              <span
                class="rounded-full px-3 py-1 text-xs font-bold"
                :class="
                  answersMap[question.id]?.is_correct
                    ? 'bg-green-500 text-white'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                "
              >
                {{
                  answersMap[question.id]?.is_correct
                    ? `Correct +${answersMap[question.id]?.points_earned} pts`
                    : "Incorrect"
                }}
              </span>
            </div>

            <div class="flex flex-col gap-4 p-5">
              <!-- Audio (oral) -->
              <ExamAudioPlayer
                v-if="question.type === 'oral' && question.audio_url"
                :src="mediaUrl(question.audio_url) ?? ''"
              />

              <!-- Image (oral et écrit) -->
              <img
                v-if="question.image_url"
                :src="mediaUrl(question.image_url) ?? ''"
                class="mx-auto max-h-96 w-auto rounded-2xl border border-line object-contain"
                alt="Document"
              />

              <!-- Texte (écrit, sans image) -->
              <div
                v-else-if="question.type === 'written' && question.question_text"
                class="whitespace-pre-wrap rounded-2xl border-l-4 border-primary bg-canvas p-5 text-[0.9375rem] leading-relaxed text-ink"
              >
                {{ question.question_text }}
              </div>

              <!-- Question posée -->
              <p v-if="question.asked_question" class="font-heading text-lg font-bold leading-snug text-ink">
                {{ question.asked_question }}
              </p>

              <!-- Réponses -->
              <div class="flex flex-col gap-2">
                <div
                  v-for="opt in getOptions(question)"
                  :key="opt.key"
                  class="flex items-start gap-3 rounded-2xl border-2 p-3.5"
                  :class="
                    isSelectedCorrect(opt.key, question, answersMap[question.id])
                      ? 'border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-950'
                      : isSelectedWrong(opt.key, question, answersMap[question.id])
                        ? 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950'
                        : isCorrectAnswer(opt.key, question)
                          ? 'border-dashed border-green-400 bg-green-50/50 dark:border-green-700 dark:bg-green-950/40'
                          : 'border-line bg-card'
                  "
                >
                  <span
                    class="grid size-7 shrink-0 place-items-center rounded-[0.7rem_0.2rem] font-heading text-xs font-extrabold"
                    :class="
                      isSelectedCorrect(opt.key, question, answersMap[question.id]) || isCorrectAnswer(opt.key, question)
                        ? 'bg-green-500 text-white'
                        : isSelectedWrong(opt.key, question, answersMap[question.id])
                          ? 'bg-red-500 text-white'
                          : 'bg-card-2 text-muted'
                    "
                  >
                    {{ opt.key.toUpperCase() }}
                  </span>
                  <span class="flex-1 pt-0.5 text-sm leading-relaxed text-ink">{{ opt.text }}</span>
                  <span
                    v-if="isSelectedCorrect(opt.key, question, answersMap[question.id])"
                    class="shrink-0 text-xs font-bold text-green-700 dark:text-green-400"
                  >
                    Votre réponse <i class="pi pi-check ml-0.5 text-[0.65rem]" />
                  </span>
                  <span
                    v-else-if="isSelectedWrong(opt.key, question, answersMap[question.id])"
                    class="shrink-0 text-xs font-bold text-red-700 dark:text-red-400"
                  >
                    Votre réponse <i class="pi pi-times ml-0.5 text-[0.65rem]" />
                  </span>
                  <span
                    v-else-if="isCorrectAnswer(opt.key, question)"
                    class="shrink-0 text-xs font-bold text-green-700 dark:text-green-400"
                  >
                    Bonne réponse
                  </span>
                </div>
              </div>

              <!-- Explication -->
              <div
                v-if="question.explanation"
                class="flex items-start gap-3 rounded-2xl border-l-4 border-accent-400 bg-accent-50 p-4 dark:bg-accent-950"
              >
                <i class="pi pi-lightbulb mt-0.5 shrink-0 text-accent-700 dark:text-accent-300" />
                <p class="text-sm leading-relaxed text-accent-900 dark:text-accent-200">{{ question.explanation }}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>

  <!-- Chargement -->
  <div v-else-if="loading" class="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas">
    <i class="pi pi-spin pi-spinner text-3xl text-primary" />
    <p class="text-sm text-muted">Chargement des résultats...</p>
  </div>

  <!-- Erreur -->
  <div v-else class="flex min-h-screen items-center justify-center bg-canvas p-4">
    <div class="flex max-w-md flex-col items-center gap-4 rounded-card border border-line bg-card p-8 text-center shadow-lift">
      <span class="grid size-14 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
        <i class="pi pi-exclamation-triangle text-xl" />
      </span>
      <p class="text-muted">{{ error }}</p>
      <AppCta
        :to="`/epreuve/${slug}/series`"
        label="Retour aux séries"
        icon="pi pi-arrow-left"
        icon-pos="left"
        variant="outline"
        size="md"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamAttemptDetailResponse } from "#shared/api/models/ExamAttemptDetailResponse";
import type { SuccessResponse_ExamAttemptDetailResponse_ } from "#shared/api/models/SuccessResponse_ExamAttemptDetailResponse_";
import type { SuccessResponse_list_dict__ } from "#shared/api/models/SuccessResponse_list_dict__";
import type { QuestionResponse } from "#shared/api/models/QuestionResponse";
import type { SuccessResponse_list_QuestionResponse__ } from "#shared/api/models/SuccessResponse_list_QuestionResponse__";

definePageMeta({ middleware: "auth", layout: "exam" });

const route = useRoute();
const { get } = useApi();
const { mediaUrl } = useMedia();
const slug = route.params.slug as string;
const attemptId = route.params.attemptId as string;

const loading = ref(true);
const error = ref<string | null>(null);
const attempt = ref<ExamAttemptDetailResponse | null>(null);
const answers = ref<Record<string, any>[]>([]);
const questions = ref<QuestionResponse[]>([]);

// Map réponses par question_id pour accès O(1)
const answersMap = computed(() => {
  const map: Record<string, any> = {};
  for (const ans of answers.value) {
    map[ans.question_id] = ans;
  }
  return map;
});

const fromSeriesId = route.query.from as string | undefined;
const fromModule = route.query.module as string | undefined; // 'co' | 'ce' | 'ee' | 'eo' | undefined

const backLink = computed(() =>
  fromSeriesId
    ? `/epreuve/${slug}/series/${fromSeriesId}`
    : `/epreuve/${slug}/series`,
);

// Remplace questions.value par questionsFiltered dans le template
const questionsFiltered = computed(() => {
  if (!fromModule) return questions.value; // séquence complète → tout afficher
  if (fromModule === "co")
    return questions.value.filter((q) => q.type === "oral");
  if (fromModule === "ce")
    return questions.value.filter((q) => q.type === "written");
  return []; // ee et eo n'ont pas de questions QCM
});

// Idem pour les réponses dans l'aperçu
const answersFiltered = computed(() => {
  if (!fromModule) return answers.value;
  if (fromModule === "co") {
    const oralIds = new Set(
      questions.value.filter((q) => q.type === "oral").map((q) => q.id),
    );
    return answers.value.filter((a) => oralIds.has(a.question_id));
  }
  if (fromModule === "ce") {
    const writtenIds = new Set(
      questions.value.filter((q) => q.type === "written").map((q) => q.id),
    );
    return answers.value.filter((a) => writtenIds.has(a.question_id));
  }
  return [];
});

const moduleLabels: Record<string, string> = {
  co: "Compréhension Orale",
  ce: "Compréhension Écrite",
  ee: "Expression Écrite",
  eo: "Expression Orale",
};

onMounted(async () => {
  try {
    const [attemptRes, answersRes] = await Promise.all([
      get<SuccessResponse_ExamAttemptDetailResponse_>(
        `/v1/exam-attempts/${attemptId}`,
      ),
      get<SuccessResponse_list_dict__>(
        `/v1/exam-attempts/${attemptId}/answers`,
      ),
    ]);
    attempt.value = attemptRes.data ?? null;
    answers.value = (answersRes.data as unknown as any[]) ?? [];

    // Charger les questions de la série
    if (attempt.value?.series_id) {
      const questionsRes = await get<SuccessResponse_list_QuestionResponse__>(
        `/v1/series/${attempt.value.series_id}/questions`,
      );
      questions.value = (questionsRes.data ?? []).sort(
        (a, b) => a.question_number - b.question_number,
      );
    }
  } catch {
    error.value = "Impossible de charger les résultats.";
  } finally {
    loading.value = false;
  }
});

// ── Computed ─────────────────────────────────────────────────
const mainScore = computed(() => {
  if (!fromModule)
    return attempt.value?.oral_score ?? attempt.value?.written_score ?? 0;
  if (fromModule === "co") return attempt.value?.oral_score ?? 0;
  if (fromModule === "ce") return attempt.value?.written_score ?? 0;
  return 0;
});

const mainLevel = computed(() => {
  if (!fromModule)
    return attempt.value?.oral_level ?? attempt.value?.written_level ?? "—";
  if (fromModule === "co") return attempt.value?.oral_level ?? "—";
  if (fromModule === "ce") return attempt.value?.written_level ?? "—";
  return "—";
});

const correctCount = computed(
  () => answersFiltered.value.filter((a) => a.is_correct).length,
);
const incorrectCount = computed(
  () => answersFiltered.value.filter((a) => !a.is_correct).length,
);

const elapsedSeconds = route.query.elapsed
  ? parseInt(route.query.elapsed as string)
  : null;

const timeSpent = computed(() => {
  // Si on vient d'un module avec elapsed, on utilise ça
  if (elapsedSeconds !== null) {
    const m = Math.floor(elapsedSeconds / 60);
    const s = elapsedSeconds % 60;
    return `${m} min ${s} sec`;
  }
  // Sinon fallback sur started_at / completed_at (séquence complète)
  if (!attempt.value?.started_at || !attempt.value?.completed_at) return "—";
  const start = new Date(attempt.value.started_at).getTime();
  const end = new Date(attempt.value.completed_at).getTime();
  const diff = Math.round((end - start) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m} min ${s} sec`;
});

// ── Options ───────────────────────────────────────────────────
function getOptions(q: QuestionResponse) {
  return [
    { key: "A", text: q.option_a },
    { key: "B", text: q.option_b },
    { key: "C", text: q.option_c },
    { key: "D", text: q.option_d },
  ];
}

function isSelectedCorrect(
  key: string,
  q: QuestionResponse,
  ans: any,
): boolean {
  return ans?.selected_answer?.toUpperCase() === key && ans?.is_correct;
}

function isSelectedWrong(key: string, q: QuestionResponse, ans: any): boolean {
  return ans?.selected_answer?.toUpperCase() === key && !ans?.is_correct;
}

function isCorrectAnswer(key: string, q: QuestionResponse): boolean {
  return q.correct_answer?.toUpperCase() === key;
}

function getOptionClass(key: string, q: QuestionResponse, ans: any): string {
  if (isSelectedCorrect(key, q, ans))
    return "correction-option--selected-correct";
  if (isSelectedWrong(key, q, ans)) return "correction-option--selected-wrong";
  if (isCorrectAnswer(key, q)) return "correction-option--correct";
  return "";
}

// ── Scroll vers question ──────────────────────────────────────
function scrollToQuestion(idx: number) {
  const el = document.getElementById(`question-${idx}`);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
}

useHead({ title: `Résultats | Lumina TCF` });
</script>

<style scoped>
/* ── Loading / Error ───────────────────────────────────────── */
.resultats-loading,
.resultats-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 1.5rem;
  text-align: center;
  color: var(--text-secondary);
}
.resultats-error i {
  font-size: 2rem;
  color: var(--color-danger-500);
}

/* ── Header ────────────────────────────────────────────────── */
.resultats__header {
  background: var(--gradient-primary);
  padding: 2.5rem 0;
  color: #ffffff;
}
.resultats__header-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}
.resultats__serie-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}
.resultats__score-main {
  display: flex;
  align-items: center;
  gap: 2rem;
}
.resultats__nclc {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.resultats__nclc-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.7);
}
.resultats__nclc-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
}
.resultats__nclc-sub {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}
.resultats__score-pts {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}
.resultats__pts-value {
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
}
.resultats__pts-max {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
}
.resultats__stats {
  display: flex;
  gap: 2.5rem;
}
.resultats__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}
.resultats__stat i {
  font-size: 1.25rem;
}
.resultats__stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
}
.resultats__stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Body ──────────────────────────────────────────────────── */
.resultats__body {
  padding-top: 2rem;
  padding-bottom: 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.resultats__section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.5rem;
}
.resultats__section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.25rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--border-color);
}

/* ── Aperçu ────────────────────────────────────────────────── */
.resultats__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 1rem;
}
.resultats__dot {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.15s;
}
.resultats__dot:hover {
  transform: scale(1.15);
}
.resultats__dot--correct {
  background: var(--color-success-500);
}
.resultats__dot--incorrect {
  background: var(--color-danger-500);
}
.resultats__dot--sm {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: 0;
  cursor: default;
}
.resultats__dot--sm:hover {
  transform: none;
}
.resultats__legend {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.resultats__legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* ── Actions ───────────────────────────────────────────────── */
.resultats__actions {
  display: flex;
  gap: 0.875rem;
  flex-wrap: wrap;
}
.resultats__action-btn {
  border-radius: 0.75rem !important;
  font-weight: 600 !important;
}

/* ── Correction list ───────────────────────────────────────── */
.correction-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.correction-card {
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  padding: 1.25rem 1.5rem;
  border-left: 4px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.correction-card--correct {
  border-left-color: var(--color-success-500);
}
.correction-card--incorrect {
  border-left-color: var(--color-danger-500);
}

.correction-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.correction-card__num {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-primary);
}
.correction-card--correct .correction-card__num i {
  color: var(--color-success-500);
}
.correction-card--incorrect .correction-card__num i {
  color: var(--color-danger-500);
}

.correction-card__type {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  background: var(--bg-ground);
  padding: 2px 8px;
  border-radius: 9999px;
}

.correction-card__header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.correction-card__audio {
  max-width: 520px;
}

.correction-card__image {
  width: 100%;
  max-height: 280px;
  object-fit: contain;
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
}

.correction-card__text {
  background: var(--bg-ground);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  font-size: 0.9375rem;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.correction-card__asked {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* ── Options correction ────────────────────────────────────── */
.correction-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
}

.correction-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1.5px solid var(--border-color);
  border-radius: 0.75rem;
  background: var(--bg-card);
  transition: all 0.2s;
}

.correction-option--selected-correct {
  border-color: var(--color-success-500);
  background: var(--color-success-50);
}
.correction-option--selected-wrong {
  border-color: var(--color-danger-500);
  background: var(--color-danger-50);
}
.correction-option--correct {
  border-color: var(--color-success-500);
  background: var(--color-success-50);
}

.correction-option__indicator {
  width: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.correction-option__icon {
  font-size: 0.875rem;
}
.correction-option__icon--ok {
  color: var(--color-success-600);
}
.correction-option__icon--ko {
  color: var(--color-danger-600);
}

.correction-option__key {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-ground);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.correction-option--selected-correct .correction-option__key,
.correction-option--correct .correction-option__key {
  background: var(--color-success-500);
  border-color: transparent;
  color: #ffffff;
}
.correction-option--selected-wrong .correction-option__key {
  background: var(--color-danger-500);
  border-color: transparent;
  color: #ffffff;
}

.correction-option__text {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.4;
}

/* Explication */
.correction-card__explanation {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  background: var(--color-secondary-50);
  border: 1px solid var(--color-secondary-200);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
}
.correction-card__explanation i {
  color: var(--color-secondary-600);
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 2px;
}
.correction-card__explanation p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 640px) {
  .resultats__score-main {
    flex-direction: column;
    gap: 1rem;
  }
  .resultats__stats {
    gap: 1.5rem;
  }
  .resultats__actions {
    flex-direction: column;
  }
  .correction-options {
    grid-template-columns: 1fr;
  }
}
</style>
