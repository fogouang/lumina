<template>
  <div class="min-h-screen bg-canvas">
    <!-- Chargement -->
    <div v-if="loading" class="flex min-h-screen flex-col items-center justify-center gap-3">
      <i class="pi pi-spin pi-spinner text-3xl text-primary" />
      <p class="text-sm text-muted">{{ msgs.loading }}</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="flex min-h-screen items-center justify-center p-4">
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

    <template v-else>
      <!-- Étapes -->
      <div class="border-b border-line bg-card px-4 py-2.5">
        <ol class="mx-auto flex max-w-4xl items-center gap-2 overflow-x-auto">
          <li v-for="(s, i) in steps" :key="s.key" class="flex shrink-0 items-center gap-2">
            <span
              class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300"
              :class="
                currentStep === i
                  ? 'brand-gradient text-white shadow-brand'
                  : completedSteps.includes(i)
                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : 'bg-card-2 text-faint'
              "
            >
              <i :class="[completedSteps.includes(i) ? 'pi pi-check' : s.icon, 'text-xs']" />
              <span class="hidden sm:inline">{{ s.label }}</span>
            </span>
            <span v-if="i < steps.length - 1" class="h-px w-4 bg-line sm:w-6" />
          </li>
        </ol>
      </div>

      <!-- Étape 1 : compréhension orale -->
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

      <!-- Étape 2 : compréhension écrite -->
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

      <!-- Étape 3 : expression écrite -->
      <ExamStepExpressionEcrite
        v-else-if="currentStep === 2"
        :tasks="writtenTasks"
        :attempt-id="attemptId!"
        :ai-credits="aiCredits"
        @next-step="goNext"
        @quit="confirmQuit = true"
      />

      <!-- Étape 4 : expression orale -->
      <ExamStepExpressionOrale
        v-else-if="currentStep === 3"
        :tasks="oralTasks"
        @finish="confirmFinish = true"
        @quit="confirmQuit = true"
      />
    </template>

    <!-- Quitter -->
    <Dialog
      v-model:visible="confirmQuit"
      modal
      :draggable="false"
      :style="{ width: '26rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <i class="pi pi-sign-out" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">Quitter l'examen ?</h3>
        </div>
      </template>
      <p class="leading-relaxed text-muted">{{ msgs.quit }}</p>
      <template #footer>
        <AppButton label="Annuler" variant="ghost" @click="confirmQuit = false" />
        <AppButton label="Quitter" icon="pi pi-sign-out" variant="danger" @click="onQuit" />
      </template>
    </Dialog>

    <!-- Terminer -->
    <Dialog
      v-model:visible="confirmFinish"
      modal
      :draggable="false"
      :style="{ width: '28rem' }"
      :breakpoints="{ '640px': '94vw' }"
      :pt="{ mask: { class: 'backdrop-blur-sm' } }"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
            <i class="pi pi-flag" />
          </span>
          <h3 class="font-heading text-lg font-bold text-ink">Terminer l'examen</h3>
        </div>
      </template>
      <p class="leading-relaxed text-muted">{{ msgs.finish }}</p>
      <template #footer>
        <AppButton label="Continuer" variant="ghost" @click="confirmFinish = false" />
        <AppButton label="Terminer" icon="pi pi-check" variant="gradient" :loading="finishing" @click="onFinish" />
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
