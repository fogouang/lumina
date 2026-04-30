<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="exam-loading">
      <ProgressSpinner style="width: 48px; height: 48px" />
      <p>Chargement de l'examen...</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="exam-error">
      <i class="pi pi-exclamation-triangle" />
      <p>{{ error }}</p>
      <NuxtLink :to="`/epreuve/${route.params.slug}/series`">
        <Button label="Retour aux séries" icon="pi pi-arrow-left" />
      </NuxtLink>
    </div>

    <!-- Examen -->
    <div v-else-if="currentQuestion" class="exam-layout">
      <!-- Gauche : question -->
      <ExamQuestionPanel
        :question="currentQuestion"
        :selected="answers[currentQuestion.id] ?? null"
        :current-index="currentIndex"
        :total="questions.length"
        :is-first="currentIndex === 0"
        :is-last="currentIndex === questions.length - 1"
        :submitting="submitting"
        class="exam-layout__panel"
        @select="onSelect"
        @prev="currentIndex--"
        @next="onNext"
        @finish="confirmFinish = true"
      />

      <!-- Droite : sidebar -->
      <ExamSidebar
        :questions="questions"
        :current-index="currentIndex"
        :answered-ids="Object.keys(answers)"
        :total-seconds="totalSeconds"
        class="exam-layout__sidebar"
        @go="currentIndex = $event"
        @quit="confirmQuit = true"
        @expired="onExpired"
      />
    </div>

    <!-- Dialog quitter -->
    <Dialog
      v-model:visible="confirmQuit"
      modal
      header="Quitter l'examen"
      :style="{ width: '400px' }"
    >
      <p style="color: var(--text-secondary); line-height: 1.6">
        Vos réponses seront perdues. Êtes-vous sûr de vouloir quitter ?
      </p>
      <template #footer>
        <Button label="Annuler" text @click="confirmQuit = false" />
        <Button
          label="Quitter"
          severity="danger"
          icon="pi pi-sign-out"
          @click="onQuit"
        />
      </template>
    </Dialog>

    <!-- Dialog terminer -->
    <Dialog
      v-model:visible="confirmFinish"
      modal
      header="Terminer l'examen"
      :style="{ width: '420px' }"
    >
      <p style="color: var(--text-secondary); line-height: 1.6">
        Vous avez répondu à
        <strong>{{ Object.keys(answers).length }}</strong> question(s) sur
        <strong>{{ questions.length }}</strong
        >. Confirmer la fin de l'examen ?
      </p>
      <template #footer>
        <Button label="Continuer" text @click="confirmFinish = false" />
        <Button
          label="Terminer"
          icon="pi pi-check"
          severity="success"
          :loading="submitting"
          @click="onFinish"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { QuestionResponse } from "#shared/api/models/QuestionResponse";
import type { SuccessResponse_ExamAttemptResponse_ } from "#shared/api/models/SuccessResponse_ExamAttemptResponse_";
import type { SuccessResponse_list_QuestionResponse__ } from "#shared/api/models/SuccessResponse_list_QuestionResponse__";

definePageMeta({ middleware: "auth", layout: "exam" });

const route = useRoute();
const { post, get } = useApi();
const toast = useToast();

const seriesId = route.params.seriesId as string;
const slug = route.params.slug as string;

// ── Durée par épreuve ────────────────────────────────────────
const durationMap: Record<string, number> = {
  "comprehension-ecrite": 60 * 60, // 60 min
  "comprehension-orale": 35 * 60, // 35 min
  "expression-ecrite": 60 * 60,
  "expression-orale": 12 * 60,
};
const totalSeconds = durationMap[slug] ?? 60 * 60;

// ── State ────────────────────────────────────────────────────
const loading = ref(true);
const error = ref<string | null>(null);
const submitting = ref(false);
const confirmQuit = ref(false);
const confirmFinish = ref(false);

const attemptId = ref<string | null>(null);
const questions = ref<QuestionResponse[]>([]);
const currentIndex = ref(0);
const answers = ref<Record<string, string>>({}); // { questionId: 'a' | 'b' | 'c' | 'd' }

const currentQuestion = computed(
  () => questions.value[currentIndex.value] ?? null,
);

// ── Init : créer la tentative + charger les questions ────────
onMounted(async () => {
  try {
    const attemptRes = await post<SuccessResponse_ExamAttemptResponse_>(
      "/v1/exam-attempts",
      { series_id: seriesId },
    );
    attemptId.value = attemptRes.data?.id ?? null;
    if (!attemptId.value) throw new Error("Impossible de démarrer l'examen.");

    const questionsRes = await get<SuccessResponse_list_QuestionResponse__>(
      `/v1/series/${seriesId}/questions`,
    );
    questions.value = (questionsRes.data ?? []).sort(
      (a, b) => a.question_number - b.question_number,
    );
  } catch (err: unknown) {
    error.value = extractError(err);
  } finally {
    loading.value = false;
  }
});

// ── Sélectionner une réponse ─────────────────────────────────
async function onSelect(key: string) {
  if (!attemptId.value || !currentQuestion.value) return;
  if (submitting.value) return;

  submitting.value = true;
  try {
    await post(`/v1/exam-attempts/${attemptId.value}/answers`, {
      question_id: currentQuestion.value.id,
      selected_answer: key,
    });
    answers.value[currentQuestion.value.id] = key;
  } catch {
    toast.add({
      severity: "error",
      summary: "Erreur de soumission",
      life: 3000,
    });
  } finally {
    submitting.value = false;
  }
}

// ── Suivant ──────────────────────────────────────────────────
async function onNext() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++;
  }
}

// ── Terminer ─────────────────────────────────────────────────
async function onFinish() {
  if (!attemptId.value) return;
  submitting.value = true;
  try {
    await post(`/v1/exam-attempts/${attemptId.value}/complete`);
    confirmFinish.value = false;
    navigateTo(`/epreuve/${slug}/resultats/${attemptId.value}`);
  } catch {
    toast.add({
      severity: "error",
      summary: "Erreur lors de la finalisation",
      life: 3000,
    });
  } finally {
    submitting.value = false;
  }
}

// ── Temps écoulé ─────────────────────────────────────────────
async function onExpired() {
  toast.add({
    severity: "warn",
    summary: "Temps écoulé !",
    detail: "L'examen est terminé.",
    life: 4000,
  });
  await onFinish();
}

// ── Quitter ──────────────────────────────────────────────────
function onQuit() {
  confirmQuit.value = false;
  navigateTo(`/epreuve/${slug}/series`);
}

function extractError(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string } }).data;
    return data?.message ?? "Une erreur est survenue";
  }
  return "Une erreur est survenue";
}

useHead({ title: `Examen | Lumina TCF` });
</script>

<style scoped>
/* ── Loading / Error ───────────────────────────────────────── */
.exam-loading,
.exam-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 1.5rem;
  text-align: center;
  color: var(--text-secondary);
}

.exam-error i {
  font-size: 2rem;
  color: var(--color-danger-500);
}

/* ── Layout ────────────────────────────────────────────────── */
.exam-layout {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1280px;
  margin: 0 auto;
  align-items: flex-start;
}

.exam-layout__panel {
  flex: 1;
  min-width: 0;
}

.exam-layout__sidebar {
  width: 280px;
  flex-shrink: 0;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .exam-layout {
    flex-direction: column-reverse; /* sidebar en haut sur mobile */
    padding: 1rem;
    gap: 1rem;
  }

  .exam-layout__sidebar {
    width: 100%;
  }
}
</style>
