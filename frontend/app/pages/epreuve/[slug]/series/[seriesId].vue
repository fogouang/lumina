<template>
  <div class="min-h-screen bg-(--bg-ground)">
    <!-- Loading -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center min-h-screen gap-4 text-(--text-secondary)"
    >
      <ProgressSpinner style="width: 48px; height: 48px" />
      <p>{{ msgs.loading }}</p>
    </div>

    <!-- Erreur -->
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center min-h-screen gap-4 text-(--text-secondary)"
    >
      <i class="pi pi-exclamation-triangle text-4xl text-red-500" />
      <p>{{ error }}</p>
      <NuxtLink :to="`/epreuve/${slug}/series`">
        <Button label="Retour aux séries" icon="pi pi-arrow-left" />
      </NuxtLink>
    </div>

    <template v-else>
      <!-- ── Indicateur de step ─────────────────────────────── -->
      <div class="bg-(--bg-card) border-b border-(--border-color) px-4 py-2">
        <div class="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto">
          <div
            v-for="(s, i) in steps"
            :key="s.key"
            class="flex items-center gap-1.5 shrink-0"
          >
            <div
              class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
              :class="
                currentStep === i
                  ? 'step-active'
                  : completedSteps.includes(i)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
              "
            >
              <i
                :class="completedSteps.includes(i) ? 'pi pi-check' : s.icon"
                class="text-xs"
              />
              <span class="hidden sm:inline">{{ s.label }}</span>
            </div>
            <i
              v-if="i < steps.length - 1"
              class="pi pi-angle-right text-(--text-tertiary) text-xs"
            />
          </div>
        </div>
      </div>

      <!-- ── Step 1 : Compréhension Orale ─────────────────── -->
      <ExamStepComprehension
        v-if="currentStep === 0 && attemptId && oralQuestions.length"
        :questions="oralQuestions"
        :all-oral-questions="oralQuestions"
        :all-written-questions="writtenQuestions"
        :attempt-id="attemptId"
        :total-seconds="35 * 60"
        :is-step-c-o="true"
        :model-value="answers"
        @update:model-value="answers = $event"
        @next-step="goNext"
        @quit="confirmQuit = true"
      />

      <!-- ── Step 2 : Compréhension Écrite ─────────────────── -->
      <ExamStepComprehension
        v-else-if="currentStep === 1 && attemptId && writtenQuestions.length"
        :questions="writtenQuestions"
        :all-oral-questions="oralQuestions"
        :all-written-questions="writtenQuestions"
        :attempt-id="attemptId"
        :total-seconds="60 * 60"
        :is-step-c-o="false"
        :model-value="answers"
        @update:model-value="answers = $event"
        @next-step="goNext"
        @quit="confirmQuit = true"
      />

      <!-- ── Step 3 : Expression Écrite ────────────────────── -->
      <ExamStepExpressionEcrite
        v-else-if="currentStep === 2"
        :tasks="writtenTasks"
        :attempt-id="attemptId!"
        :ai-credits="aiCredits"
        @next-step="goNext"
        @quit="confirmQuit = true"
      />

      <!-- ── Step 4 : Expression Orale ─────────────────────── -->
      <ExamStepExpressionOrale
        v-else-if="currentStep === 3"
        :tasks="oralTasks"
        @finish="confirmFinish = true"
        @quit="confirmQuit = true"
      />
    </template>

    <!-- Dialog quitter -->
    <Dialog
      v-model:visible="confirmQuit"
      modal
      header="Quitter l'examen"
      :style="{ width: '380px' }"
    >
      <p class="text-(--text-secondary) leading-relaxed">
        {{ msgs.quit }}
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
      <p class="text-(--text-secondary) leading-relaxed">
        {{ msgs.finish }}
      </p>
      <template #footer>
        <Button label="Continuer" text @click="confirmFinish = false" />
        <Button
          label="Terminer"
          icon="pi pi-check"
          severity="success"
          :loading="finishing"
          @click="onFinish"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import ExamStepComprehension from "~/components/Exam/steps/ExamStepComprehension.vue";
import ExamStepExpressionEcrite from "~/components/Exam/steps/ExamStepExpressionEcrite.vue";
import ExamStepExpressionOrale from "~/components/Exam/steps/ExamStepExpressionOrale.vue";

import type { QuestionResponse } from "#shared/api/models/QuestionResponse";
import type { ExpressionTaskResponse } from "#shared/api/models/ExpressionTaskResponse";
import type { SuccessResponse_ExamAttemptResponse_ } from "#shared/api/models/SuccessResponse_ExamAttemptResponse_";
import type { SuccessResponse_list_ExamAttemptResponse__ } from "#shared/api/models/SuccessResponse_list_ExamAttemptResponse__";
import type { SuccessResponse_list_QuestionResponse__ } from "#shared/api/models/SuccessResponse_list_QuestionResponse__";
import type { SuccessResponse_list_ExpressionTaskResponse__ } from "#shared/api/models/SuccessResponse_list_ExpressionTaskResponse__";

definePageMeta({ middleware: "auth", layout: "exam" });

const msgs = {
  loading: "Chargement de l'examen...",
  quit: "Vos réponses déjà soumises sont sauvegardées. Vous pourrez reprendre plus tard.",
  finish:
    "Vous avez complété les 4 modules. Terminer l'examen et voir vos résultats ?",
};

const route = useRoute();
const { post, get } = useApi();
const toast = useToast();
const sub = useSubscriptionStore();
const slug = route.params.slug as string;
const seriesId = route.params.seriesId as string;

// ── State ────────────────────────────────────────────────────
const loading = ref(true);
const error = ref<string | null>(null);
const finishing = ref(false);
const confirmQuit = ref(false);
const confirmFinish = ref(false);
const currentStep = ref(0);
const completedSteps = ref<number[]>([]);

const attemptId = ref<string | null>(null);
const oralQuestions = ref<QuestionResponse[]>([]);
const writtenQuestions = ref<QuestionResponse[]>([]);
const writtenTasks = ref<ExpressionTaskResponse[]>([]);
const oralTasks = ref<ExpressionTaskResponse[]>([]);
const answers = ref<Record<string, string>>({});
const aiCredits = computed(() => sub.aiCreditsRemaining ?? 0);

// ── Steps ────────────────────────────────────────────────────
const steps = [
  { key: "co", label: "Compréhension Orale", icon: "pi pi-headphones" },
  { key: "ce", label: "Compréhension Écrite", icon: "pi pi-book" },
  { key: "ee", label: "Expression Écrite", icon: "pi pi-pen-to-square" },
  { key: "eo", label: "Expression Orale", icon: "pi pi-microphone" },
];

// ── Init ─────────────────────────────────────────────────────
onMounted(async () => {
  try {
    await sub.fetchMySubscriptions();

    // Tentative
    try {
      const res = await post<SuccessResponse_ExamAttemptResponse_>(
        "/v1/exam-attempts",
        { series_id: seriesId },
      );
      attemptId.value = res.data?.id ?? null;
    } catch {
      const list =
        await get<SuccessResponse_list_ExamAttemptResponse__>(
          "/v1/exam-attempts",
        );
      const ex = (list.data ?? []).find(
        (a) => a.series_id === seriesId && a.status === "in_progress",
      );
      if (ex) attemptId.value = ex.id;
      else throw new Error("Impossible de démarrer l'examen.");
    }

    // Questions
    const qRes = await get<SuccessResponse_list_QuestionResponse__>(
      `/v1/series/${seriesId}/questions`,
    );
    const allQ = (qRes.data ?? []).sort(
      (a, b) => a.question_number - b.question_number,
    );
    oralQuestions.value = allQ.filter((q) => q.type === "oral");
    writtenQuestions.value = allQ.filter((q) => q.type === "written");

    // Tâches expression
    const tRes = await get<SuccessResponse_list_ExpressionTaskResponse__>(
      `/v1/expression-tasks/series/${seriesId}`,
    );
    const allT = tRes.data ?? [];
    writtenTasks.value = allT.filter((t) => t.type === "written");
    oralTasks.value = allT.filter((t) => t.type === "oral");
  } catch (err: unknown) {
    error.value = (err as Error)?.message ?? "Une erreur est survenue.";
  } finally {
    loading.value = false;
  }
  console.log("oralQuestions:", oralQuestions.value.length);
  console.log("writtenQuestions:", writtenQuestions.value.length);
  console.log("attemptId:", attemptId.value);
  console.log("currentStep:", currentStep.value);
});

// ── Navigation steps ─────────────────────────────────────────
function goNext() {
  completedSteps.value.push(currentStep.value);
  currentStep.value++;
}

// ── Terminer ─────────────────────────────────────────────────
async function onFinish() {
  if (!attemptId.value) return;
  finishing.value = true;
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
    finishing.value = false;
  }
}

function onQuit() {
  confirmQuit.value = false;
  navigateTo(`/epreuve/${slug}/series`);
}

useHead({ title: "Examen | Lumina TCF" });
</script>

<style scoped>
.step-active {
  background: var(--gradient-primary);
  color: #ffffff;
}
</style>
