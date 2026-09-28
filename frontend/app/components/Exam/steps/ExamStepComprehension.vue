<template>
  <div class="min-h-screen bg-canvas">
    <!-- ── DESKTOP ────────────────────────────────────────────── -->
    <div class="hidden min-h-screen lg:flex">
      <!-- Sidebar gauche -->
      <aside
        class="sticky top-0 flex h-screen w-76 shrink-0 flex-col gap-3 overflow-y-auto border-r border-line bg-card p-3 shadow-[4px_0_24px_-12px_rgb(15_23_42/0.18)]"
      >
        <!-- Timer -->
        <ExamTimer :total-seconds="totalSeconds" @expired="onExpired" />

        <!-- Navigation -->
        <div
          class="rounded-2xl border border-line bg-linear-to-b from-card-2 to-canvas p-3.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.6)] dark:shadow-none"
        >
          <div class="mb-3.5">
            <div class="flex items-center justify-between gap-2">
              <p class="font-heading text-xs font-bold uppercase tracking-wider text-ink">
                Navigation
              </p>
              <span class="font-heading text-xs font-bold tabular-nums text-muted">
                {{ answeredInStep }} <span class="text-faint">/ {{ questions.length }} répondues</span>
              </span>
            </div>
            <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
              <div
                class="h-full rounded-full bg-linear-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                :style="{ width: `${progress}%` }"
              />
            </div>
          </div>

          <!-- CO -->
          <div class="mb-4 transition-opacity" :class="!isStepCO ? 'opacity-50' : ''">
            <p class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted">
              <i class="pi pi-headphones text-xs text-primary" />
              Compréhension Orale
              <i v-if="!isStepCO" class="pi pi-lock ml-auto text-xs opacity-60" />
            </p>
            <div class="grid grid-cols-8 gap-1.5">
              <ExamNavButton
                v-for="(q, i) in allOralQuestions"
                :key="q.id"
                :label="q.question_number"
                :current="isStepCO && i === currentIndex"
                :answered="!!answersMap[q.id]"
                :locked="!isStepCO"
                @click="onNavGo('co', i)"
              />
            </div>
          </div>

          <!-- CE -->
          <div class="transition-opacity" :class="isStepCO ? 'opacity-50' : ''">
            <p class="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted">
              <i class="pi pi-book text-xs text-primary" />
              Compréhension Écrite
              <i v-if="isStepCO" class="pi pi-lock ml-auto text-xs opacity-60" />
            </p>
            <div class="grid grid-cols-8 gap-1.5">
              <ExamNavButton
                v-for="(q, i) in allWrittenQuestions"
                :key="q.id"
                :label="q.question_number"
                :current="!isStepCO && i === currentIndex"
                :answered="!!answersMap[q.id]"
                :locked="isStepCO"
                @click="onNavGo('ce', i)"
              />
            </div>
          </div>

          <!-- Légende -->
          <ExamNavLegend class="mt-4 border-t border-line pt-3" />
        </div>

        <!-- Quitter -->
        <button
          type="button"
          class="mt-auto flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/60 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950"
          @click="emit('quit')"
        >
          <i class="pi pi-sign-out" />
          Quitter l'examen
        </button>
      </aside>

      <!-- Zone question -->
      <main class="min-w-0 flex-1 overflow-y-auto p-5">
        <ExamQuestionPanel
          v-if="currentQuestion"
          :question="currentQuestion"
          :selected="answers[currentQuestion.id] ?? null"
          :current-index="currentIndex"
          :total="questions.length"
          :is-first="currentIndex === 0"
          :is-last="currentIndex === questions.length - 1"
          :submitting="submitting"
          @select="onSelect"
          @prev="onPrev"
          @next="onNext"
          @finish="onFinishStep"
        />
      </main>
    </div>

    <!-- ── MOBILE ─────────────────────────────────────────────── -->
    <div class="flex min-h-screen flex-col lg:hidden">
      <ExamTopBar
        :total-seconds="totalSeconds"
        :current-index="currentIndex"
        :total="questions.length"
        :answered-count="Object.keys(answers).length"
        @open-nav="navOpen = true"
        @quit="emit('quit')"
        @expired="onExpired"
      />

      <!-- Question -->
      <div class="flex-1 overflow-y-auto p-3 pb-0">
        <ExamQuestionPanel
          v-if="currentQuestion"
          :question="currentQuestion"
          :selected="answers[currentQuestion.id] ?? null"
          :current-index="currentIndex"
          :total="questions.length"
          :is-first="currentIndex === 0"
          :is-last="currentIndex === questions.length - 1"
          :submitting="submitting"
          @select="onSelect"
          @prev="onPrev"
          @next="onNext"
          @finish="onFinishStep"
        />
      </div>

      <!-- Footer -->
      <ExamFooterBar
        v-if="currentQuestion"
        :is-first="currentIndex === 0"
        :is-last="currentIndex === questions.length - 1"
        :selected="answers[currentQuestion.id] ?? null"
        :level="getLevel(currentQuestion.points)"
        :pts="currentQuestion.points"
        @prev="onPrev"
        @next="onNext"
        @finish="onFinishStep"
      />
    </div>

    <!-- Nav drawer mobile -->
    <ExamNavDrawer
      v-model="navOpen"
      :questions="questions"
      :current-index="currentIndex"
      :answered-ids="Object.keys(answers)"
      @go="onGo"
    />
  </div>
</template>

<script setup lang="ts">
import type { QuestionResponse } from "#shared/api/models/QuestionResponse";

const props = defineProps<{
  questions: QuestionResponse[];
  allOralQuestions: QuestionResponse[];
  allWrittenQuestions: QuestionResponse[];
  attemptId: string;
  totalSeconds: number;
  isStepCO: boolean;
  modelValue: Record<string, string>;
}>();

const emit = defineEmits<{
  "update:modelValue": [val: Record<string, string>];
  "next-step": [];
  quit: [];
}>();

const { post } = useApi();

const answers = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const answersMap = computed(() => props.modelValue);
const isStepCO = computed(() => props.isStepCO);
const currentIndex = ref(0);
const submitting = ref(false);
const navOpen = ref(false);
const currentQuestion = computed(
  () => props.questions[currentIndex.value] ?? null,
);

// Progression du module en cours (affichage)
const answeredInStep = computed(
  () => props.questions.filter((q) => answersMap.value[q.id]).length,
);
const progress = computed(() =>
  props.questions.length ? (answeredInStep.value / props.questions.length) * 100 : 0,
);

function onSelect(key: string) {
  if (!currentQuestion.value) return;
  answers.value = { ...answers.value, [currentQuestion.value.id]: key };
}

async function submitCurrentAnswer() {
  if (!currentQuestion.value) return;
  const selected = answers.value[currentQuestion.value.id];
  if (!selected) return;
  try {
    await post(`/v1/exam-attempts/${props.attemptId}/answers`, {
      question_id: currentQuestion.value.id,
      selected_answer: selected,
    });
  } catch {
    /* silencieux */
  }
}

async function onNext() {
  await submitCurrentAnswer();
  if (currentIndex.value < props.questions.length - 1) currentIndex.value++;
}

async function onPrev() {
  await submitCurrentAnswer();
  if (currentIndex.value > 0) currentIndex.value--;
}

async function onGo(index: number) {
  await submitCurrentAnswer();
  currentIndex.value = index;
  navOpen.value = false;
}

async function onNavGo(type: "co" | "ce", index: number) {
  // On ne navigue que dans le module en cours
  if ((isStepCO.value && type === "ce") || (!isStepCO.value && type === "co")) return;
  await submitCurrentAnswer();
  currentIndex.value = index;
}

async function onFinishStep() {
  await submitCurrentAnswer();
  emit("next-step");
}

async function onExpired() {
  await submitCurrentAnswer();
  emit("next-step");
}

function getLevel(pts: number): string {
  if (pts <= 3) return "A1";
  if (pts <= 9) return "A2";
  if (pts <= 15) return "B1";
  if (pts <= 21) return "B2";
  if (pts <= 26) return "C1";
  return "C2";
}
</script>