<template>
  <div class="flex min-h-[calc(100vh-56px)]">
    <!-- ── SIDEBAR GAUCHE ── -->
    <aside
      class="hidden lg:flex flex-col w-56 bg-(--bg-card) border-r border-(--border-color) sticky top-0 h-screen overflow-y-auto shrink-0"
    >
      <p
        class="text-[10px] font-bold uppercase tracking-widest text-(--text-tertiary) px-4 pt-4 pb-2"
      >
        Navigation
      </p>

      <button
        v-for="(t, i) in tasksMeta"
        :key="t.key"
        class="flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-xl border text-left transition-all"
        :class="
          activeTask === i
            ? 'bg-primary-50 border-primary-200'
            : 'border-transparent hover:bg-(--bg-hover)'
        "
        @click="activeTask = i"
      >
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          :class="isTaskDone(i) ? 'bg-green-500' : 'bg-gradient-primary'"
        >
          <i v-if="isTaskDone(i)" class="pi pi-check text-[10px]" />
          <span v-else>{{ i + 1 }}</span>
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-(--text-primary) truncate">
            {{ t.shortLabel }}
          </p>
          <p class="text-[10px] text-(--text-tertiary) font-mono">
            {{ wc(answers[t.key]) }}/{{ t.max }}
          </p>
        </div>
      </button>

      <!-- Actions sidebar -->
      <div
        v-if="!correction"
        class="mt-auto p-3 border-t border-(--border-color) flex flex-col gap-2"
      >
        <!-- Soumettre IA -->
        <Button
          v-if="aiCredits > 0"
          label="Soumettre"
          icon="pi pi-sparkles"
          icon-pos="right"
          :loading="submitting"
          :disabled="!allAnswered"
          class="bg-gradient-primary border-none font-bold w-full text-sm"
          @click="submitAll"
        />
        <!-- Télécharger PDF -->
        <Button
          label="Télécharger PDF"
          icon="pi pi-download"
          icon-pos="right"
          :loading="generatingPdf"
          :disabled="!allAnswered"
          outlined
          class="w-full text-sm"
          @click="downloadPdf"
        />
        <p class="text-[10px] text-(--text-tertiary) text-center leading-snug">
          <span v-if="!allAnswered">Complétez les 3 tâches</span>
          <span v-else-if="aiCredits > 0"
            >Prêt · <strong>1 crédit IA</strong></span
          >
          <span v-else>Pas de crédits — téléchargez votre devoir</span>
        </p>
      </div>
    </aside>

    <!-- ── ZONE CENTRALE ── -->
    <main class="flex-1 min-w-0 px-4 lg:px-6 py-5 flex flex-col gap-4">
      <!-- Alerte pas de crédits -->
      <div
        v-if="aiCredits === 0 && !correction"
        class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4"
      >
        <i class="pi pi-exclamation-triangle text-amber-500 shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="font-bold text-amber-800 text-sm mb-0.5">
            Pas de crédits IA
          </p>
          <p class="text-sm text-amber-700">
            Rédigez vos 3 tâches puis téléchargez votre devoir en PDF.
          </p>
        </div>
      </div>

      <!-- ── RÉDACTION ── -->
      <template v-if="!correction">
        <div
          class="bg-(--bg-card) border border-(--border-color) rounded-2xl overflow-hidden"
        >
          <!-- Header tâche active -->
          <div
            class="flex items-center gap-3 px-5 py-3.5 border-b border-(--border-color) bg-(--bg-ground)"
          >
            <div
              class="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0"
            >
              {{ activeTask + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-(--text-primary)">
                {{ currentMeta.label }}
              </p>
              <p class="text-xs text-(--text-tertiary)">
                {{ currentMeta.min }}–{{ currentMeta.max }} mots recommandés
              </p>
            </div>
            <Tag
              :value="currentMeta.typeLabel"
              severity="warning"
              class="shrink-0"
            />
          </div>

          <!-- Consigne -->
          <div class="px-5 py-4 border-b border-(--border-color)">
            <template v-if="activeTask === 0">
              <p class="text-sm text-(--text-primary) leading-relaxed">
                {{ tasks[0]?.instruction_text }}
              </p>
            </template>
            <template v-else-if="activeTask === 1">
              <p class="text-sm text-(--text-primary) leading-relaxed">
                {{ tasks[1]?.instruction_text }}
              </p>
            </template>
            <template v-else>
              <h3 class="text-base font-bold text-(--text-primary) mb-3">
                {{ tasks[2]?.title }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  v-if="tasks[2]?.document_1"
                  class="bg-amber-50 border border-amber-200 rounded-xl p-3.5"
                >
                  <p
                    class="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1.5"
                  >
                    Document 1
                  </p>
                  <p class="text-sm text-(--text-primary) leading-relaxed">
                    {{ tasks[2].document_1 }}
                  </p>
                </div>
                <div
                  v-if="tasks[2]?.document_2"
                  class="bg-blue-50 border border-blue-200 rounded-xl p-3.5"
                >
                  <p
                    class="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-1.5"
                  >
                    Document 2
                  </p>
                  <p class="text-sm text-(--text-primary) leading-relaxed">
                    {{ tasks[2].document_2 }}
                  </p>
                </div>
              </div>
            </template>
          </div>

          <!-- Textarea -->
          <Textarea
            v-model="answers[currentMeta.key]"
            :rows="11"
            fluid
            :placeholder="`Rédigez votre ${currentMeta.typeLabel.toLowerCase()} ici…`"
            class="text-sm leading-relaxed rounded-none border-x-0 border-b-0"
          />

          <!-- Footer compteur -->
          <div
            class="flex items-center justify-between px-5 py-2.5 border-t border-(--border-color) bg-(--bg-ground)"
          >
            <span
              class="text-xs font-mono font-semibold"
              :class="
                wcClass(
                  wc(answers[currentMeta.key]),
                  currentMeta.min,
                  currentMeta.max,
                )
              "
            >
              {{ wc(answers[currentMeta.key]) }} / {{ currentMeta.max }} mots
            </span>
            <span
              v-if="wc(answers[currentMeta.key]) >= currentMeta.min"
              class="text-xs text-green-600 flex items-center gap-1"
            >
              <i class="pi pi-check-circle" /> Minimum atteint
            </span>
          </div>
        </div>

        <!-- Navigation mobile -->
        <div class="flex items-center justify-between gap-3 lg:hidden">
          <Button
            icon="pi pi-chevron-left"
            outlined
            :disabled="activeTask === 0"
            @click="activeTask--"
          />
          <span class="text-sm font-semibold text-(--text-secondary)"
            >Tâche {{ activeTask + 1 }} / 3</span
          >
          <Button
            v-if="activeTask < 2"
            label="Suivant"
            icon="pi pi-chevron-right"
            icon-pos="right"
            outlined
            @click="activeTask++"
          />
          <Button
            v-else-if="aiCredits > 0"
            label="Soumettre"
            icon="pi pi-sparkles"
            icon-pos="right"
            :loading="submitting"
            :disabled="!allAnswered"
            class="bg-gradient-primary border-none font-bold"
            @click="submitAll"
          />
          <Button
            v-else
            label="Télécharger PDF"
            icon="pi pi-download"
            icon-pos="right"
            :loading="generatingPdf"
            :disabled="!allAnswered"
            outlined
            @click="downloadPdf"
          />
        </div>
      </template>

      <!-- ── RÉSULTATS CORRECTION IA ── -->
      <template v-else>
        <!-- Score hero -->
        <div
          class="bg-gradient-primary rounded-2xl p-8 text-center text-white flex flex-col items-center gap-2"
        >
          <i class="pi pi-check-circle text-5xl opacity-90" />
          <p class="text-6xl font-extrabold leading-none">
            {{ correction.global_assessment.overall_score
            }}<span class="text-2xl opacity-60">/20</span>
          </p>
          <p class="text-lg font-semibold opacity-80">
            Niveau {{ correction.global_assessment.cecrl_level }}
          </p>
          <p class="text-sm opacity-70 max-w-sm leading-relaxed">
            {{ correction.global_assessment.appreciation }}
          </p>
        </div>

        <!-- Critères -->
        <div
          class="bg-(--bg-card) border border-(--border-color) rounded-2xl p-5"
        >
          <h3
            class="font-bold text-(--text-primary) mb-4 flex items-center gap-2 text-sm"
          >
            <i class="pi pi-chart-bar text-primary-500" /> Scores par critère
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="item in criteriaItems"
              :key="item.label"
              class="bg-(--bg-ground) rounded-xl p-3 text-center"
            >
              <p class="text-xl font-extrabold text-primary-600 mb-0.5">
                {{ item.score
                }}<span class="text-sm opacity-60">/{{ item.max }}</span>
              </p>
              <p class="text-xs font-semibold text-(--text-secondary) mb-1">
                {{ item.label }}
              </p>
              <p class="text-xs text-(--text-tertiary) leading-relaxed">
                {{ item.feedback }}
              </p>
            </div>
          </div>
        </div>

        <!-- Feedbacks par tâche -->
        <div
          v-if="correction.task_feedbacks"
          class="bg-(--bg-card) border border-(--border-color) rounded-2xl p-5"
        >
          <h3
            class="font-bold text-(--text-primary) mb-4 flex items-center gap-2 text-sm"
          >
            <i class="pi pi-file-edit text-primary-500" /> Versions corrigées
            par tâche
          </h3>
          <div class="flex flex-col gap-4">
            <div v-for="(tKey, idx) in ['task1', 'task2', 'task3']" :key="tKey">
              <div
                v-if="correction.task_feedbacks[tKey]"
                class="border border-(--border-color) rounded-xl overflow-hidden"
              >
                <div
                  class="flex items-center gap-2 px-4 py-3 bg-(--bg-ground) border-b border-(--border-color)"
                >
                  <div
                    class="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0"
                  >
                    {{ idx + 1 }}
                  </div>
                  <span class="font-semibold text-sm text-(--text-primary)">{{
                    [
                      "Tâche 1 — Message",
                      "Tâche 2 — Narration",
                      "Tâche 3 — Argumentation",
                    ][idx]
                  }}</span>
                </div>
                <div
                  class="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 border-b border-(--border-color)"
                >
                  <div
                    v-if="
                      correction.task_feedbacks[tKey].main_strengths?.length
                    "
                  >
                    <p class="text-xs font-semibold text-green-700 mb-1">
                      Points forts
                    </p>
                    <ul class="flex flex-col gap-1">
                      <li
                        v-for="s in correction.task_feedbacks[tKey]
                          .main_strengths"
                        :key="s"
                        class="text-xs text-green-700 flex items-start gap-1"
                      >
                        <i class="pi pi-check shrink-0 mt-0.5" />{{ s }}
                      </li>
                    </ul>
                  </div>
                  <div
                    v-if="
                      correction.task_feedbacks[tKey].main_weaknesses?.length
                    "
                  >
                    <p class="text-xs font-semibold text-red-700 mb-1">
                      Points à améliorer
                    </p>
                    <ul class="flex flex-col gap-1">
                      <li
                        v-for="w in correction.task_feedbacks[tKey]
                          .main_weaknesses"
                        :key="w"
                        class="text-xs text-red-700 flex items-start gap-1"
                      >
                        <i class="pi pi-times shrink-0 mt-0.5" />{{ w }}
                      </li>
                    </ul>
                  </div>
                </div>
                <div
                  v-if="correction.task_feedbacks[tKey].corrected_text"
                  class="px-4 py-4"
                >
                  <p
                    class="text-[10px] font-bold text-primary-600 uppercase tracking-wide mb-2"
                  >
                    Proposition de correction
                  </p>
                  <p
                    class="text-sm text-(--text-primary) leading-relaxed whitespace-pre-wrap bg-(--bg-ground) rounded-lg p-3"
                  >
                    {{ correction.task_feedbacks[tKey].corrected_text }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Erreurs -->
        <div
          v-if="correction.corrections?.length"
          class="bg-(--bg-card) border border-(--border-color) rounded-2xl p-5"
        >
          <h3
            class="font-bold text-(--text-primary) mb-4 flex items-center gap-2 text-sm"
          >
            <i class="pi pi-pencil text-primary-500" /> Erreurs identifiées
          </h3>
          <div class="flex flex-col gap-3">
            <div
              v-for="(c, i) in correction.corrections"
              :key="i"
              class="bg-red-50 border border-red-100 rounded-xl p-4"
            >
              <div class="flex items-center gap-2 flex-wrap mb-2">
                <Tag
                  v-if="c.task"
                  :value="`Tâche ${c.task}`"
                  severity="danger"
                />
                <span class="text-sm font-bold text-red-700 line-through">{{
                  c.error
                }}</span>
                <i class="pi pi-arrow-right text-red-400 text-xs" />
                <span class="text-sm font-bold text-green-700">{{
                  c.correction
                }}</span>
              </div>
              <p class="text-xs text-(--text-secondary) leading-relaxed">
                {{ c.explanation }}
              </p>
            </div>
          </div>
        </div>

        <!-- Suggestions -->
        <div
          v-if="correction.suggestions?.length"
          class="bg-(--bg-card) border border-(--border-color) rounded-2xl p-5"
        >
          <h3
            class="font-bold text-(--text-primary) mb-4 flex items-center gap-2 text-sm"
          >
            <i class="pi pi-lightbulb text-primary-500" /> Conseils pour
            progresser
          </h3>
          <div class="flex flex-col gap-2">
            <div
              v-for="(s, i) in correction.suggestions"
              :key="i"
              class="flex items-start gap-3 bg-(--bg-ground) rounded-xl p-3"
            >
              <div
                class="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0"
              >
                {{ i + 1 }}
              </div>
              <p class="text-sm text-(--text-secondary) leading-relaxed">
                {{ s }}
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center pb-8">
          <Button
            label="Continuer vers Expression Orale"
            icon="pi pi-arrow-right"
            icon-pos="right"
            severity="success"
            class="font-bold"
            @click="emit('next-step')"
          />
        </div>
      </template>
    </main>

    <!-- ── PANEL DROIT ── -->
    <aside
      class="hidden xl:flex flex-col w-52 bg-(--bg-card) border-l border-(--border-color) sticky top-0 h-screen overflow-y-auto shrink-0 p-4 gap-5"
    >
      <p
        class="text-[10px] font-bold uppercase tracking-widest text-(--text-tertiary)"
      >
        Outils
      </p>
      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold text-(--text-secondary)">
          Caractères spéciaux
        </p>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="ch in specialChars"
            :key="ch"
            class="w-8 h-8 text-sm flex items-center justify-center bg-(--bg-ground) border border-(--border-color) rounded-md text-(--text-primary) hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors font-medium"
            @click="insertChar(ch)"
          >
            {{ ch }}
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-3">
        <p class="text-xs font-semibold text-(--text-secondary)">Progression</p>
        <div
          v-for="(t, i) in tasksMeta"
          :key="t.key"
          class="flex flex-col gap-1"
        >
          <div class="flex justify-between items-center">
            <span class="text-xs text-(--text-secondary)"
              >Tâche {{ i + 1 }}</span
            >
            <span
              class="text-[10px] font-mono font-semibold"
              :class="wcClass(wc(answers[t.key]), t.min, t.max)"
            >
              {{ wc(answers[t.key]) }}/{{ t.max }}
            </span>
          </div>
          <div
            class="h-1.5 rounded-full bg-(--bg-ground) border border-(--border-color) overflow-hidden"
          >
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="{
                'bg-red-400': wc(answers[t.key]) < t.min,
                'bg-green-500':
                  wc(answers[t.key]) >= t.min && wc(answers[t.key]) <= t.max,
                'bg-amber-400': wc(answers[t.key]) > t.max,
              }"
              :style="{
                width: Math.min(100, (wc(answers[t.key]) / t.max) * 100) + '%',
              }"
            />
          </div>
        </div>
      </div>
      <div
        class="mt-auto flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3"
      >
        <i class="pi pi-info-circle text-amber-500 text-xs shrink-0 mt-0.5" />
        <p class="text-[10px] text-amber-800 leading-snug">
          Laisser une tâche vide entraîne automatiquement une note éliminatoire
          de 0/20.
        </p>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import type { ExpressionTaskResponse } from "#shared/api/models/ExpressionTaskResponse";

const props = defineProps<{
  tasks: ExpressionTaskResponse[]; // les 3 tâches written
  attemptId: string;
  aiCredits: number;
}>();

const emit = defineEmits<{ "next-step": []; quit: [] }>();

const { post } = useApi();
const toast = useToast();

const activeTask = ref(0);
const submitting = ref(false);
const generatingPdf = ref(false);
const specialChars = [
  "é",
  "è",
  "ê",
  "ë",
  "à",
  "â",
  "ù",
  "û",
  "ü",
  "ç",
  "ô",
  "œ",
  "æ",
  "·",
  "»",
  "«",
];

const answers = reactive({ task1: "", task2: "", task3: "" });

const correction = ref<{
  global_assessment: {
    overall_score: number;
    cecrl_level: string;
    appreciation: string;
  };
  criteria_scores: {
    structure_score: number;
    structure_feedback: string;
    cohesion_score: number;
    cohesion_feedback: string;
    vocabulary_score: number;
    vocabulary_feedback: string;
    grammar_score: number;
    grammar_feedback: string;
    task_score: number;
    task_feedback: string;
  };
  task_feedbacks: Record<
    string,
    {
      corrected_text: string;
      main_strengths: string[];
      main_weaknesses: string[];
    }
  >;
  corrections: Array<{
    error: string;
    correction: string;
    explanation: string;
    task?: string;
  }>;
  suggestions: string[];
} | null>(null);

type TaskMeta = {
  key: "task1" | "task2" | "task3";
  label: string;
  shortLabel: string;
  typeLabel: string;
  min: number;
  max: number;
};

// Construit tasksMeta depuis les ExpressionTaskResponse
const tasksMeta = computed<TaskMeta[]>(() =>
  props.tasks.slice(0, 3).map((t, i) => ({
    key: `task${i + 1}` as "task1" | "task2" | "task3",
    label: t.title ?? `Tâche ${i + 1}`,
    shortLabel:
      (["Message", "Narration", "Argumentation"] as const)[i] ?? "Tâche",
    typeLabel:
      (["Message court", "Narration / Blog", "Argumentation"] as const)[i] ??
      "Tâche",
    min: t.word_count_min ?? 0,
    max: t.word_count_max ?? 999,
  })),
);

const currentMeta = computed<TaskMeta>(
  () =>
    tasksMeta.value[activeTask.value] ?? {
      key: "task1",
      label: "Tâche 1",
      shortLabel: "Message",
      typeLabel: "Message court",
      min: 0,
      max: 999,
    },
);

const allAnswered = computed(() =>
  tasksMeta.value.every((t) => wc(answers[t.key]) >= t.min),
);

const criteriaItems = computed(() => {
  if (!correction.value) return [];
  const c = correction.value.criteria_scores;
  return [
    {
      label: "Structure",
      score: c.structure_score,
      feedback: c.structure_feedback,
      max: 5,
    },
    {
      label: "Cohésion",
      score: c.cohesion_score,
      feedback: c.cohesion_feedback,
      max: 4,
    },
    {
      label: "Vocabulaire",
      score: c.vocabulary_score,
      feedback: c.vocabulary_feedback,
      max: 4,
    },
    {
      label: "Grammaire",
      score: c.grammar_score,
      feedback: c.grammar_feedback,
      max: 3,
    },
    { label: "Tâches", score: c.task_score, feedback: c.task_feedback, max: 4 },
  ];
});

function wc(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function wcClass(count: number, min: number, max: number) {
  if (count < min) return "text-red-500";
  if (count > max) return "text-amber-500";
  return "text-green-600";
}

function isTaskDone(i: number) {
  const t = tasksMeta.value[i];
  return t ? wc(answers[t.key]) >= t.min : false;
}

function insertChar(ch: string) {
  const key = tasksMeta.value[activeTask.value]?.key;
  if (key) answers[key] += ch;
}

// ── Soumettre toutes les tâches + correction IA ──
async function submitAll() {
  if (!props.tasks[0] || !props.tasks[1] || !props.tasks[2]) return;
  submitting.value = true;
  try {
    // 1. Sauvegarder les 3 tâches
    await Promise.all([
      post(`/v1/written-expressions/attempts/${props.attemptId}`, {
        task_id: props.tasks[0].id,
        text_content: answers.task1,
      }),
      post(`/v1/written-expressions/attempts/${props.attemptId}`, {
        task_id: props.tasks[1].id,
        text_content: answers.task2,
      }),
      post(`/v1/written-expressions/attempts/${props.attemptId}`, {
        task_id: props.tasks[2].id,
        text_content: answers.task3,
      }),
    ]);

    // 2. Correction IA combinée
    const t0 = props.tasks[0];
    const t1 = props.tasks[1];
    const t2 = props.tasks[2];
    const res = await post<any>("/v1/written-expressions/ai-correct-combined", {
      task1_content: answers.task1,
      task1_instruction: t0.instruction_text,
      task1_word_min: t0.word_count_min,
      task1_word_max: t0.word_count_max,
      task2_content: answers.task2,
      task2_instruction: t1.instruction_text,
      task2_word_min: t1.word_count_min,
      task2_word_max: t1.word_count_max,
      task3_content: answers.task3,
      task3_instruction:
        t2.title +
        (t2.document_1 ? `\n\nDocument 1:\n${t2.document_1}` : "") +
        (t2.document_2 ? `\n\nDocument 2:\n${t2.document_2}` : ""),
      task3_word_min: t2.word_count_min,
      task3_word_max: t2.word_count_max,
    });
    correction.value = res.data ?? res;
  } catch (err: any) {
    toast.add({
      severity: "error",
      summary: "Erreur",
      detail: err?.data?.message ?? "Correction impossible",
      life: 4000,
    });
  } finally {
    submitting.value = false;
  }
}

// ── Télécharger PDF ──
async function downloadPdf() {
  generatingPdf.value = true;
  try {
    const t0 = props.tasks[0];
    const t1 = props.tasks[1];
    const t2 = props.tasks[2];

    const html = `
      <html><head><meta charset="utf-8"><style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; }
        h1 { font-size: 20px; border-bottom: 2px solid #c00; padding-bottom: 8px; margin-bottom: 24px; }
        h2 { font-size: 15px; color: #c00; margin: 24px 0 8px; }
        .instruction { background: #f5f5f5; border-left: 3px solid #c00; padding: 10px 14px; font-size: 13px; margin-bottom: 12px; }
        .answer { border: 1px solid #ddd; padding: 14px; border-radius: 6px; font-size: 13px; line-height: 1.8; white-space: pre-wrap; min-height: 80px; }
        .meta { font-size: 11px; color: #888; margin-bottom: 16px; }
      </style></head><body>
        <h1>Expression Écrite — Devoir</h1>
        <div class="meta">Attempt : ${props.attemptId} · ${new Date().toLocaleDateString("fr-FR")}</div>

        <h2>Tâche 1 — ${t0?.title ?? "Message"}</h2>
        <div class="instruction">${t0?.instruction_text ?? ""}</div>
        <div class="answer">${answers.task1 || "(non rédigé)"}</div>

        <h2>Tâche 2 — ${t1?.title ?? "Narration"}</h2>
        <div class="instruction">${t1?.instruction_text ?? ""}</div>
        <div class="answer">${answers.task2 || "(non rédigé)"}</div>

        <h2>Tâche 3 — ${t2?.title ?? "Argumentation"}</h2>
        <div class="instruction">${t2?.instruction_text ?? ""}</div>
        ${t2?.document_1 ? `<div class="instruction"><strong>Document 1 :</strong> ${t2.document_1}</div>` : ""}
        ${t2?.document_2 ? `<div class="instruction"><strong>Document 2 :</strong> ${t2.document_2}</div>` : ""}
        <div class="answer">${answers.task3 || "(non rédigé)"}</div>
      </body></html>
    `;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    win?.print();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } finally {
    generatingPdf.value = false;
  }
}
</script>
