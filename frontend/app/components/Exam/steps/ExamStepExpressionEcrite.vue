<template>
  <div class="flex flex-col min-h-screen bg-(--bg-ground)">
    <!-- Header -->
    <div
      class="bg-(--bg-card) border-b border-(--border-color) px-4 py-3 flex items-center justify-between sticky top-0 z-10"
    >
      <div>
        <h2 class="text-base font-bold text-(--text-primary)">
          Expression Écrite
        </h2>
        <p class="text-xs text-(--text-tertiary)">
          Tâche {{ currentTaskIndex + 1 }} / {{ tasks.length }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Tag
          :value="`${tasks.length} tâche${tasks.length > 1 ? 's' : ''}`"
          severity="info"
        />
        <Button
          icon="pi pi-arrow-right"
          label="Passer"
          text
          size="small"
          @click="onSkip"
        />
      </div>
    </div>

    <!-- Tâche courante -->
    <div class="flex-1 overflow-y-auto p-4 lg:p-8">
      <div class="max-w-3xl mx-auto space-y-6" v-if="currentTask">
        <!-- Instructions -->
        <div
          class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
        >
          <div class="flex items-center gap-2 mb-3">
            <i class="pi pi-info-circle text-primary-500" />
            <span
              class="text-sm font-bold text-(--text-primary) uppercase tracking-wide"
              >Instructions</span
            >
          </div>
          <p
            v-if="currentTask.instruction_text"
            class="text-(--text-secondary) leading-relaxed text-sm"
          >
            {{ currentTask.instruction_text }}
          </p>
          <div
            v-if="currentTask.word_count_min || currentTask.word_count_max"
            class="flex gap-3 mt-3"
          >
            <Tag
              v-if="currentTask.word_count_min"
              :value="`Min ${currentTask.word_count_min} mots`"
              severity="warning"
            />
            <Tag
              v-if="currentTask.word_count_max"
              :value="`Max ${currentTask.word_count_max} mots`"
              severity="warning"
            />
          </div>
        </div>

        <!-- Documents -->
        <div
          v-if="currentTask.document_1 || currentTask.document_2"
          class="grid gap-4"
          :class="currentTask.document_2 ? 'lg:grid-cols-2' : ''"
        >
          <div
            v-if="currentTask.document_1"
            class="bg-amber-50 border border-amber-200 rounded-xl p-4"
          >
            <p class="text-xs font-bold text-amber-700 uppercase mb-2">
              Document 1
            </p>
            <p
              class="text-sm text-(--text-primary) leading-relaxed whitespace-pre-wrap"
            >
              {{ currentTask.document_1 }}
            </p>
          </div>
          <div
            v-if="currentTask.document_2"
            class="bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <p class="text-xs font-bold text-red-700 uppercase mb-2">
              Document 2
            </p>
            <p
              class="text-sm text-(--text-primary) leading-relaxed whitespace-pre-wrap"
            >
              {{ currentTask.document_2 }}
            </p>
          </div>
        </div>

        <!-- Zone de rédaction -->
        <div
          class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-bold text-(--text-primary)"
              >Votre réponse</span
            >
            <span
              class="text-xs font-mono px-2 py-1 rounded-lg"
              :class="
                wordCountOk
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'
              "
            >
              {{ wordCount }} mots
            </span>
          </div>
          <Textarea
            v-model="textContent"
            :rows="10"
            fluid
            placeholder="Rédigez votre réponse ici..."
            class="font-sans text-sm leading-relaxed"
            :disabled="submitted[currentTask.id]"
          />
        </div>

        <!-- Correction IA (si soumis + crédits) -->
        <div
          v-if="submitted[currentTask.id] && aiCorrections[currentTask.id]"
          class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
        >
          <div class="flex items-center gap-2 mb-4">
            <i class="pi pi-sparkles text-red-500" />
            <span class="text-sm font-bold text-(--text-primary)"
              >Correction IA</span
            >
            <Tag
              :value="`${aiCorrections[currentTask.id].score}/20`"
              severity="success"
            />
          </div>
          <div class="space-y-3">
            <div
              v-if="aiCorrections[currentTask.id].feedback"
              class="text-sm text-(--text-secondary) leading-relaxed bg-(--bg-ground) rounded-lg p-3"
            >
              {{ aiCorrections[currentTask.id].feedback }}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between gap-3 pb-6">
          <Button
            v-if="!submitted[currentTask.id]"
            label="Soumettre"
            icon="pi pi-send"
            :loading="submittingTask"
            :disabled="!textContent.trim() || !wordCountOk"
            class="bg-gradient-primary border-none font-bold rounded-xl"
            @click="onSubmit"
          />
          <div
            v-else
            class="flex items-center gap-2 text-green-600 text-sm font-semibold"
          >
            <i class="pi pi-check-circle" />
            Soumis
          </div>

          <Button
            v-if="isLastTask"
            label="Continuer vers Expression Orale"
            icon="pi pi-arrow-right"
            icon-pos="right"
            severity="success"
            class="font-bold rounded-xl"
            @click="emit('next-step')"
          />
          <Button
            v-else
            label="Tâche suivante"
            icon="pi pi-arrow-right"
            icon-pos="right"
            outlined
            class="rounded-xl"
            @click="onNextTask"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExpressionTaskResponse } from "#shared/api/models/ExpressionTaskResponse";
import type { SuccessResponse_WrittenExpressionResponse_ } from "#shared/api/models/SuccessResponse_WrittenExpressionResponse_";
import type { SuccessResponse_AICorrectionResponse_ } from "#shared/api/models/SuccessResponse_AICorrectionResponse_";

const props = defineProps<{
  tasks: ExpressionTaskResponse[];
  attemptId: string;
  aiCredits: number;
}>();

const emit = defineEmits<{
  "next-step": [];
  quit: [];
}>();

const { post, get } = useApi();
const toast = useToast();

const currentTaskIndex = ref(0);
const textContent = ref("");
const submittingTask = ref(false);
const submitted = ref<Record<string, boolean>>({});
const expressionIds = ref<Record<string, string>>({});
const aiCorrections = ref<Record<string, any>>({});

const currentTask = computed(() => props.tasks[currentTaskIndex.value] ?? null);
const isLastTask = computed(
  () => currentTaskIndex.value === props.tasks.length - 1,
);

const wordCount = computed(() =>
  textContent.value.trim() ? textContent.value.trim().split(/\s+/).length : 0,
);

const wordCountOk = computed(() => {
  const min = currentTask.value?.word_count_min ?? 0;
  const max = currentTask.value?.word_count_max ?? Infinity;
  return wordCount.value >= min && wordCount.value <= max;
});

async function onSubmit() {
  if (!currentTask.value) return;
  submittingTask.value = true;
  try {
    const res = await post<SuccessResponse_WrittenExpressionResponse_>(
      `/v1/written-expressions/attempts/${props.attemptId}`,
      { task_id: currentTask.value.id, text_content: textContent.value },
    );
    const exprId = res.data?.id;
    if (exprId) {
      submitted.value[currentTask.value.id] = true;
      expressionIds.value[currentTask.value.id] = exprId;

      // Correction IA si crédits disponibles
      if (props.aiCredits > 0) {
        await requestAiCorrection(exprId, currentTask.value.id);
      }
    }
  } catch {
    toast.add({
      severity: "error",
      summary: "Erreur de soumission",
      life: 3000,
    });
  } finally {
    submittingTask.value = false;
  }
}

async function requestAiCorrection(exprId: string, taskId: string) {
  try {
    const res = await post<SuccessResponse_AICorrectionResponse_>(
      `/v1/written-expressions/${exprId}/ai-correction`,
    );
    if (res.data) {
      aiCorrections.value[taskId] = res.data;
    }
  } catch {
    /* silencieux */
  }
}

function onNextTask() {
  if (currentTaskIndex.value < props.tasks.length - 1) {
    currentTaskIndex.value++;
    textContent.value = "";
  }
}

function onSkip() {
  if (isLastTask.value) emit("next-step");
  else onNextTask();
}
</script>
