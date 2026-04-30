<template>
  <div class="resultats" v-if="attempt">
    <!-- ── Header ────────────────────────────────────────────── -->
    <div class="resultats__header">
      <div class="resultats__header-inner container">
        <div class="resultats__serie-badge">
          <i class="pi pi-check-circle" />
          Série {{ attempt.series_number }} · Terminée
        </div>

        <div class="resultats__score-main">
          <div class="resultats__nclc">
            <span class="resultats__nclc-label">Niveau</span>
            <span class="resultats__nclc-value">{{ mainLevel }}</span>
            <span class="resultats__nclc-sub">NCLC {{ mainLevel }}</span>
          </div>
          <div class="resultats__score-pts">
            <span class="resultats__pts-value">{{ mainScore }}</span>
            <span class="resultats__pts-max">/699</span>
          </div>
        </div>

        <div class="resultats__stats">
          <div class="resultats__stat">
            <i class="pi pi-check-circle" style="color: #22c55e" />
            <span class="resultats__stat-value">{{ correctCount }}</span>
            <span class="resultats__stat-label">Correctes</span>
          </div>
          <div class="resultats__stat">
            <i class="pi pi-times-circle" style="color: #ef4444" />
            <span class="resultats__stat-value">{{ incorrectCount }}</span>
            <span class="resultats__stat-label">Incorrectes</span>
          </div>
          <div class="resultats__stat">
            <i class="pi pi-clock" style="color: #f59e0b" />
            <span class="resultats__stat-value">{{ timeSpent }}</span>
            <span class="resultats__stat-label">Temps passé</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container resultats__body">
      <!-- ── Aperçu des réponses ──────────────────────────────── -->
      <div class="resultats__section">
        <h2 class="resultats__section-title">Aperçu des réponses</h2>
        <div class="resultats__grid">
          <div
            v-for="(ans, idx) in answers"
            :key="idx"
            class="resultats__dot"
            :class="{
              'resultats__dot--correct': ans.is_correct,
              'resultats__dot--incorrect': !ans.is_correct,
            }"
            :title="`Question ${idx + 1}`"
            @click="scrollToQuestion(idx)"
          >
            {{ idx + 1 }}
          </div>
        </div>
        <div class="resultats__legend">
          <span class="resultats__legend-item">
            <span
              class="resultats__dot resultats__dot--correct resultats__dot--sm"
            />
            Correcte
          </span>
          <span class="resultats__legend-item">
            <span
              class="resultats__dot resultats__dot--incorrect resultats__dot--sm"
            />
            Incorrecte
          </span>
        </div>
      </div>

      <!-- ── Actions ──────────────────────────────────────────── -->
      <div class="resultats__actions">
        <NuxtLink :to="`/epreuve/${slug}/series`">
          <Button
            label="Retour aux séries"
            icon="pi pi-arrow-left"
            outlined
            class="resultats__action-btn"
          />
        </NuxtLink>
        <NuxtLink :to="`/epreuve/${slug}/series/${attempt.series_id}`">
          <Button
            label="Refaire cette série"
            icon="pi pi-refresh"
            class="resultats__action-btn bg-gradient-primary"
          />
        </NuxtLink>
      </div>

      <!-- ── Correction détaillée ─────────────────────────────── -->
      <div class="resultats__section">
        <h2 class="resultats__section-title">Correction détaillée</h2>

        <div class="correction-list">
          <div
            v-for="(question, idx) in questions"
            :key="question.id"
            :id="`question-${idx}`"
            class="correction-card"
            :class="{
              'correction-card--correct': answersMap[question.id]?.is_correct,
              'correction-card--incorrect':
                !answersMap[question.id]?.is_correct,
            }"
          >
            <!-- Header question -->
            <div class="correction-card__header">
              <div class="correction-card__num">
                <i
                  :class="
                    answersMap[question.id]?.is_correct
                      ? 'pi pi-check'
                      : 'pi pi-times'
                  "
                />
                Question {{ question.question_number }}
                <span class="correction-card__type">
                  {{
                    question.type === "oral"
                      ? "Compréhension Orale"
                      : "Compréhension Écrite"
                  }}
                </span>
              </div>
              <div class="correction-card__header-right">
                <Tag
                  :value="
                    answersMap[question.id]?.is_correct
                      ? `Correct +${answersMap[question.id]?.points_earned} pts`
                      : 'Incorrect'
                  "
                  :severity="
                    answersMap[question.id]?.is_correct ? 'success' : 'danger'
                  "
                />
              </div>
            </div>

            <!-- Contenu : audio (oral) -->
            <div
              v-if="question.type === 'oral' && question.audio_url"
              class="correction-card__audio"
            >
              <ExamAudioPlayer :src="mediaUrl(question.audio_url) ?? ''" />
            </div>

            <!-- Contenu : image ou texte (écrit) -->
            <template v-if="question.type === 'written'">
              <img
                v-if="question.image_url"
                :src="mediaUrl(question.image_url) ?? ''"
                class="correction-card__image"
                alt="Document"
              />
              <div
                v-else-if="question.question_text"
                class="correction-card__text"
              >
                {{ question.question_text }}
              </div>
            </template>

            <!-- Image optionnelle oral -->
            <img
              v-if="question.type === 'oral' && question.image_url"
              :src="mediaUrl(question.image_url) ?? ''"
              class="correction-card__image"
              alt="Document"
            />

            <!-- Question posée -->
            <p v-if="question.asked_question" class="correction-card__asked">
              {{ question.asked_question }}
            </p>

            <!-- Options avec correction colorée -->
            <div class="correction-options">
              <div
                v-for="opt in getOptions(question)"
                :key="opt.key"
                class="correction-option"
                :class="
                  getOptionClass(opt.key, question, answersMap[question.id])
                "
              >
                <div class="correction-option__indicator">
                  <i
                    v-if="
                      isSelectedCorrect(
                        opt.key,
                        question,
                        answersMap[question.id],
                      )
                    "
                    class="pi pi-check correction-option__icon correction-option__icon--ok"
                  />
                  <i
                    v-else-if="
                      isSelectedWrong(
                        opt.key,
                        question,
                        answersMap[question.id],
                      )
                    "
                    class="pi pi-times correction-option__icon correction-option__icon--ko"
                  />
                  <i
                    v-else-if="isCorrectAnswer(opt.key, question)"
                    class="pi pi-check correction-option__icon correction-option__icon--ok"
                  />
                </div>
                <span class="correction-option__key">{{ opt.key }}</span>
                <span class="correction-option__text">{{ opt.text }}</span>
              </div>
            </div>

            <!-- Explication -->
            <div
              v-if="question.explanation"
              class="correction-card__explanation"
            >
              <i class="pi pi-lightbulb" />
              <p>{{ question.explanation }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div v-else-if="loading" class="resultats-loading">
    <ProgressSpinner style="width: 48px; height: 48px" />
    <p>Chargement des résultats...</p>
  </div>

  <!-- Erreur -->
  <div v-else class="resultats-error container">
    <i class="pi pi-exclamation-triangle" />
    <p>{{ error }}</p>
    <NuxtLink :to="`/epreuve/${slug}/series`">
      <Button label="Retour aux séries" icon="pi pi-arrow-left" />
    </NuxtLink>
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
const mainScore = computed(
  () => attempt.value?.oral_score ?? attempt.value?.written_score ?? 0,
);

const mainLevel = computed(
  () => attempt.value?.oral_level ?? attempt.value?.written_level ?? "—",
);

const correctCount = computed(
  () => answers.value.filter((a) => a.is_correct).length,
);
const incorrectCount = computed(
  () => answers.value.filter((a) => !a.is_correct).length,
);

const timeSpent = computed(() => {
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
