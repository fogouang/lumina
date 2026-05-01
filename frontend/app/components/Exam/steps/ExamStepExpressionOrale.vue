<template>
  <div class="flex flex-col min-h-screen bg-(--bg-ground)">
    <!-- Header -->
    <div
      class="bg-(--bg-card) border-b border-(--border-color) px-4 py-3 flex items-center justify-between sticky top-0 z-10"
    >
      <div>
        <h2 class="text-base font-bold text-(--text-primary)">
          Expression Orale
        </h2>
        <p class="text-xs text-(--text-tertiary)">
          Tâche {{ currentTaskIndex + 1 }} / {{ tasks.length }}
        </p>
      </div>
      <Tag value="Entraînement local" severity="warning" />
    </div>

    <!-- Tâche -->
    <div class="flex-1 overflow-y-auto p-4 lg:p-8">
      <div class="max-w-2xl mx-auto space-y-6" v-if="currentTask">
        <!-- Instructions audio -->
        <div
          v-if="currentTask.instruction_audio_url"
          class="bg-(--bg-card) border border-(--border-color) rounded-xl p-4"
        >
          <p class="text-xs font-bold text-(--text-tertiary) uppercase mb-3">
            Consigne audio
          </p>
          <ExamAudioPlayer
            :src="mediaUrl(currentTask.instruction_audio_url) ?? ''"
          />
        </div>

        <!-- Sujet -->
        <div
          class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
        >
          <div class="flex items-center gap-2 mb-3">
            <i class="pi pi-microphone text-primary-500" />
            <span
              class="text-sm font-bold text-(--text-primary) uppercase tracking-wide"
              >Sujet</span
            >
          </div>
          <p
            v-if="currentTask.title"
            class="text-lg font-bold text-(--text-primary) mb-2"
          >
            {{ currentTask.title }}
          </p>
          <p
            v-if="currentTask.instruction_text"
            class="text-sm text-(--text-secondary) leading-relaxed"
          >
            {{ currentTask.instruction_text }}
          </p>
          <div
            v-if="currentTask.document_1"
            class="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3"
          >
            <p class="text-sm text-(--text-primary) whitespace-pre-wrap">
              {{ currentTask.document_1 }}
            </p>
          </div>

          <!-- Timer préparation -->
          <div
            v-if="currentTask.preparation_time_seconds && prepPhase"
            class="mt-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <i class="pi pi-clock text-red-500" />
            <span class="text-sm font-semibold text-red-700">
              Préparation : {{ prepTimeLeft }}s restantes
            </span>
          </div>
        </div>

        <!-- Zone enregistrement -->
        <div
          class="bg-(--bg-card) border border-(--border-color) rounded-xl p-5"
        >
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-bold text-(--text-primary)"
              >Votre enregistrement</span
            >
            <span
              v-if="isRecording"
              class="flex items-center gap-1.5 text-red-500 text-sm font-semibold animate-pulse"
            >
              <span class="w-2 h-2 bg-red-500 rounded-full inline-block" />
              {{ recordingTime }}s
            </span>
          </div>

          <!-- Boutons enregistrement -->
          <div class="flex items-center justify-center gap-4 mb-4">
            <Button
              v-if="!isRecording && !blobUrl"
              :label="
                prepPhase
                  ? `Préparez-vous (${prepTimeLeft}s)`
                  : 'Commencer l\'enregistrement'
              "
              icon="pi pi-microphone"
              :disabled="prepPhase"
              class="bg-gradient-primary border-none font-bold rounded-xl px-6"
              @click="startRecording"
            />
            <Button
              v-if="isRecording"
              label="Arrêter"
              icon="pi pi-stop"
              severity="danger"
              class="font-bold rounded-xl px-6"
              @click="stopRecording"
            />
            <Button
              v-if="blobUrl && !isRecording"
              label="Recommencer"
              icon="pi pi-refresh"
              outlined
              class="rounded-xl"
              @click="resetRecording"
            />
          </div>

          <!-- Lecteur réécoute -->
          <div v-if="blobUrl" class="mt-2">
            <p class="text-xs text-(--text-tertiary) mb-2 text-center">
              Réécoutez votre enregistrement
            </p>
            <audio :src="blobUrl" controls class="w-full rounded-lg" />
            <p class="text-xs text-center text-(--text-tertiary) mt-2 italic">
              ⚠️ Cet enregistrement est local — il ne sera pas sauvegardé.
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between gap-3 pb-6">
          <Button
            v-if="!isLastTask"
            label="Tâche suivante"
            icon="pi pi-arrow-right"
            icon-pos="right"
            outlined
            class="rounded-xl"
            @click="onNextTask"
          />
          <Button
            v-else
            label="Terminer l'examen"
            icon="pi pi-check"
            icon-pos="right"
            severity="success"
            class="font-bold rounded-xl ml-auto"
            @click="emit('finish')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExpressionTaskResponse } from "#shared/api/models/ExpressionTaskResponse";

const props = defineProps<{
  tasks: ExpressionTaskResponse[];
}>();

const emit = defineEmits<{
  finish: [];
  quit: [];
}>();

const { mediaUrl } = useMedia();

const currentTaskIndex = ref(0);
const currentTask = computed(() => props.tasks[currentTaskIndex.value] ?? null);
const isLastTask = computed(
  () => currentTaskIndex.value === props.tasks.length - 1,
);

// ── Préparation ───────────────────────────────────────────────
const prepPhase = ref(false);
const prepTimeLeft = ref(0);
let prepInterval: ReturnType<typeof setInterval> | null = null;

function startPrepPhase() {
  const secs = currentTask.value?.preparation_time_seconds ?? 0;
  if (!secs) return;
  prepPhase.value = true;
  prepTimeLeft.value = secs;
  prepInterval = setInterval(() => {
    prepTimeLeft.value--;
    if (prepTimeLeft.value <= 0) {
      clearInterval(prepInterval!);
      prepPhase.value = false;
    }
  }, 1000);
}

// ── Enregistrement ────────────────────────────────────────────
const isRecording = ref(false);
const recordingTime = ref(0);
const blobUrl = ref<string | null>(null);
let mediaRecorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let recInterval: ReturnType<typeof setInterval> | null = null;
let maxTimeout: ReturnType<typeof setTimeout> | null = null;

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      blobUrl.value = URL.createObjectURL(blob);
      stream.getTracks().forEach((t) => t.stop());
    };
    mediaRecorder.start();
    isRecording.value = true;
    recordingTime.value = 0;
    recInterval = setInterval(() => {
      recordingTime.value++;
    }, 1000);

    // Arrêt auto si recording_time_seconds défini
    const maxSecs = currentTask.value?.recording_time_seconds;
    if (maxSecs) {
      maxTimeout = setTimeout(() => stopRecording(), maxSecs * 1000);
    }
  } catch {
    alert("Microphone non accessible.");
  }
}

function stopRecording() {
  mediaRecorder?.stop();
  isRecording.value = false;
  if (recInterval) clearInterval(recInterval);
  if (maxTimeout) clearTimeout(maxTimeout);
}

function resetRecording() {
  if (blobUrl.value) URL.revokeObjectURL(blobUrl.value);
  blobUrl.value = null;
  recordingTime.value = 0;
  // Relancer la préparation
  if (currentTask.value?.preparation_time_seconds) startPrepPhase();
}

function onNextTask() {
  if (blobUrl.value) URL.revokeObjectURL(blobUrl.value);
  blobUrl.value = null;
  recordingTime.value = 0;
  prepPhase.value = false;
  if (prepInterval) clearInterval(prepInterval);
  currentTaskIndex.value++;
  if (currentTask.value?.preparation_time_seconds) startPrepPhase();
}

onMounted(() => {
  if (currentTask.value?.preparation_time_seconds) startPrepPhase();
});

onUnmounted(() => {
  if (blobUrl.value) URL.revokeObjectURL(blobUrl.value);
  if (prepInterval) clearInterval(prepInterval);
  if (recInterval) clearInterval(recInterval);
  if (maxTimeout) clearTimeout(maxTimeout);
});
</script>
