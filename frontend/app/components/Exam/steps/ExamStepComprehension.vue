<template>
  <div class="step">
    <!-- ── DESKTOP ────────────────────────────────────────────── -->
    <div class="step__desktop">
      <!-- Sidebar gauche -->
      <aside class="step__sidebar">
        <!-- Timer -->
        <ExamTimer :total-seconds="totalSeconds" @expired="onExpired" />

        <!-- Navigation -->
        <div class="step__nav-card">
          <p class="step__nav-title">Navigation des questions</p>

          <!-- CO -->
          <div class="step__nav-section">
            <p class="step__nav-label">
              <i class="pi pi-headphones text-xs" />
              Compréhension Orale
            </p>
            <div class="step__nav-grid">
              <button
                v-for="(q, i) in allOralQuestions"
                :key="q.id"
                class="step__nav-btn"
                :class="{
                  'step__nav-btn--current': isStepCO && i === currentIndex,
                  'step__nav-btn--answered': answersMap[q.id],
                }"
                @click="onNavGo('co', i)"
              >
                {{ q.question_number }}
              </button>
            </div>
          </div>

          <!-- CE -->
          <div
            class="step__nav-section"
            :class="{ 'step__nav-section--locked': isStepCO }"
          >
            <p class="step__nav-label">
              <i class="pi pi-book text-xs" />
              Compréhension Écrite
              <i
                v-if="isStepCO"
                class="pi pi-lock text-xs ml-auto opacity-50"
              />
            </p>
            <div class="step__nav-grid">
              <button
                v-for="(q, i) in allWrittenQuestions"
                :key="q.id"
                class="step__nav-btn"
                :class="{
                  'step__nav-btn--current': !isStepCO && i === currentIndex,
                  'step__nav-btn--answered': answersMap[q.id],
                  'step__nav-btn--locked': isStepCO,
                }"
                :disabled="isStepCO"
                @click="onNavGo('ce', i)"
              >
                {{ q.question_number }}
              </button>
            </div>
          </div>

          <!-- Légende -->
          <div class="step__legend">
            <span class="step__legend-item"
              ><span class="step__dot step__dot--current" />Actuelle</span
            >
            <span class="step__legend-item"
              ><span class="step__dot step__dot--answered" />Répondue</span
            >
            <span class="step__legend-item"
              ><span class="step__dot step__dot--none" />Non rép.</span
            >
          </div>
        </div>

        <!-- Quitter -->
        <button class="step__quit" @click="emit('quit')">
          <i class="pi pi-sign-out" /> Quitter l'examen
        </button>
      </aside>

      <!-- Zone question -->
      <main class="step__main">
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
    <!-- Topbar sticky -->
    <div class="step__mobile">
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
const currentIndex = ref(0);
const submitting = ref(false);
const navOpen = ref(false);
const currentQuestion = computed(
  () => props.questions[currentIndex.value] ?? null,
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
  if (isStepCO && type === "ce") return;
  await submitCurrentAnswer();
  currentIndex.value = index;
}

const isStepCO = computed(() => props.isStepCO);

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

<style scoped>
.step {
  min-height: 100vh;
  background: var(--bg-ground);
}

/* ── Desktop ───────────────────────────────────────────────── */
.step__desktop {
  display: none;
}

@media (min-width: 1024px) {
  .step__desktop {
    display: flex;
    gap: 0;
    min-height: 100vh;
  }
  .step__mobile {
    display: none;
  }
}

/* Sidebar */
.step__sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

/* Main */
.step__main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Nav card */
.step__nav-card {
  flex: 1;
  overflow-y: auto;
}

.step__nav-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.75rem;
}

.step__nav-section {
  margin-bottom: 0.875rem;
}

.step__nav-section--locked {
  opacity: 0.45;
}

.step__nav-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.step__nav-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.25rem;
}

.step__nav-btn {
  aspect-ratio: 1;
  border-radius: 0.375rem;
  border: 1px solid var(--border-color);
  background: var(--bg-ground);
  color: var(--text-secondary);
  font-size: 0.625rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step__nav-btn:hover:not(:disabled) {
  border-color: var(--color-primary-400);
  color: var(--color-primary-600);
}

.step__nav-btn--current {
  background: var(--gradient-primary);
  border-color: transparent;
  color: #ffffff;
}

.step__nav-btn--answered {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #15803d;
}

.step__nav-btn--locked {
  cursor: not-allowed;
  pointer-events: none;
}

/* Légende */
.step__legend {
  display: flex;
  gap: 0.625rem;
  flex-wrap: wrap;
  padding-top: 0.625rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0.625rem;
}

.step__legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

.step__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.step__dot--current {
  background: var(--color-primary-500);
}
.step__dot--answered {
  background: #22c55e;
}
.step__dot--none {
  background: transparent;
  border: 1px solid var(--border-color);
}

/* Quitter */
.step__quit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem;
  background: none;
  border: 1px solid var(--color-danger-200);
  border-radius: 0.75rem;
  color: var(--color-danger-600);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.step__quit:hover {
  background: var(--color-danger-50);
}

/* ── Mobile ────────────────────────────────────────────────── */
.step__mobile {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

@media (min-width: 1024px) {
  .step__mobile {
    display: none;
  }
}
</style>
