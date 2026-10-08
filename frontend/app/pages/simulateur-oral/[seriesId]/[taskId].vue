<script setup lang="ts">
import type { ExpressionTaskResponse } from "#shared/api/models/ExpressionTaskResponse";
import type { SuccessResponse_list_ExpressionTaskResponse__ } from "#shared/api/models/SuccessResponse_list_ExpressionTaskResponse__";
definePageMeta({ layout: "account", middleware: "auth" });

const route = useRoute();
const seriesId = route.params.seriesId as string;
const taskId = route.params.taskId as string;

const { get } = useApi();

const loadingTask = ref(true);
const taskError = ref<string | null>(null);
const task = ref<ExpressionTaskResponse | null>(null);

// idle: chargement | connecting: WS ouvert, attente session_ready | intro: l'IA
// lit la mise en situation (Tâche 2) | prep: pause locale | live: échange en
// cours (le chrono officiel ne démarre qu'après timer_start) | ended: session
// terminée, correction en cours | graded: résultat reçu | error: connexion
// perdue ou correction échouée
type Phase =
  | "idle"
  | "connecting"
  | "intro"
  | "prep"
  | "live"
  | "ended"
  | "graded"
  | "error";
const phase = ref<Phase>("idle");

const transcript = ref<{ speaker: "candidat" | "examinateur"; text: string }[]>(
  [],
);
const micError = ref<string | null>(null);
const wsError = ref<string | null>(null);

const preparationTimeSeconds = ref(0);
const recordingTimeSeconds = ref(0);

// Avatar : qui parle en ce moment (purement présentationnel — piloté par les
// signaux agent_speaking/student_turn envoyés par le back).
const micState = ref<"agent_speaking" | "student_turn" | null>(null);
// Le chrono officiel de la tâche ne s'affiche/démarre qu'une fois cet
// événement reçu — c'est-à-dire une fois que l'IA a fini sa toute première
// prise de parole (présentation + consigne, ou phrase d'invitation Tâche 2).
const timerStarted = ref(false);

// Tuile de l'examinatrice (expose la sortie audio de l'avatar 3D)
const avatarRef = ref<{
  getAudioOutput: () => { ctx: AudioContext; node: AudioNode } | null;
} | null>(null);

// Interface d'appel
const showTranscript = ref(true);
const cameraEnabled = ref(false);
// Nom de l'examinatrice si le back l'envoie dans session_ready (sinon libellé générique)
const examinerName = ref<string | null>(null);
// Flux micro exposé à la vignette candidat (anneau de niveau)
const micStreamUi = shallowRef<MediaStream | null>(null);

interface CriterionScore {
  name: string;
  score: number;
  comment: string;
}

interface GradingResult {
  attempt_id: string;
  task_number: number;
  criteria: CriterionScore[];
  total_score: number;
  capped: boolean;
  cap_reason: string | null;
  strengths: string[];
  improvement_areas: string[];
  summary: string;
}

const gradingResult = ref<GradingResult | null>(null);

// Thème immersif "appel" pour toutes les phases actives ; thème clair
// "rapport" une fois le résultat affiché.
const isCallTheme = computed(() => phase.value !== "graded");

// Regroupe les chunks consécutifs du même locuteur en une seule bulle,
// sans altérer les données brutes du transcript.
const groupedTranscript = computed(() => {
  const groups: { speaker: string; text: string }[] = [];
  for (const line of transcript.value) {
    const last = groups[groups.length - 1];
    if (last && last.speaker === line.speaker) {
      last.text = `${last.text} ${line.text}`.replace(/\s+/g, " ").trim();
    } else {
      groups.push({ speaker: line.speaker, text: line.text.trim() });
    }
  }
  return groups;
});

onMounted(async () => {
  try {
    // Pas de GET unitaire exposé pour l'instant : on refiltre la liste EO de la
    // série et on retrouve la tâche par id.
    const res = await get<SuccessResponse_list_ExpressionTaskResponse__>(
      `/v1/expression-tasks/series/${seriesId}`,
    );
    const found = (res.data ?? []).find(
      (t) => t.id === taskId && t.type === "oral",
    );
    if (!found) {
      taskError.value = "Ce sujet est introuvable.";
      return;
    }
    task.value = found;
  } catch {
    taskError.value = "Impossible de charger ce sujet.";
  } finally {
    loadingTask.value = false;
  }

  if (task.value) {
    connectWebSocket();
  }
});

// ── WebSocket ────────────────────────────────────────────────────
let ws: WebSocket | null = null;

function connectWebSocket(): void {
  phase.value = "connecting";
  wsError.value = null;

  const config = useRuntimeConfig();
  const wsUrl = `${config.public.expressionOraleWsBaseUrl}/api/v1/expression-orale/ws/${taskId}`;

  ws = new WebSocket(wsUrl);
  ws.binaryType = "arraybuffer";

  ws.onmessage = (event) => {
    if (typeof event.data !== "string") {
      playAudioChunk(event.data as ArrayBuffer);
      return;
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    switch (data.type) {
      case "session_ready":
        preparationTimeSeconds.value =
          (data.preparation_time_seconds as number) ?? 0;
        recordingTimeSeconds.value = data.recording_time_seconds as number;
        examinerName.value = (data.examiner_name as string | undefined) ?? null;
        if (preparationTimeSeconds.value > 0) {
          phase.value = "intro"; // l'IA va lire la mise en situation
        } else {
          phase.value = "live";
          startStreamingMic();
        }
        break;

      case "transcript_update":
        transcript.value.push({
          speaker:
            (data.speaker as "candidat" | "examinateur") ?? "examinateur",
          text: data.text as string,
        });
        break;

      case "agent_speaking":
        micState.value = "agent_speaking";
        break;

      case "student_turn":
        micState.value = "student_turn";
        break;

      case "timer_start":
        // L'IA a fini sa première intervention — le chrono officiel démarre
        // seulement maintenant, pas depuis l'ouverture de la connexion.
        timerStarted.value = true;
        break;

      case "prep_started":
        phase.value = "prep";
        break;

      case "session_ended":
        if (data.reason === "error") {
          wsError.value =
            (data.detail as string | undefined) ??
            "La correction a échoué après la fin de l'enregistrement. Votre transcript n'a pas pu être noté.";
          phase.value = "error";
        } else {
          phase.value = "ended";
        }
        stopStreamingMic();
        stopPlaybackAudio();
        break;

      case "grading_result":
        gradingResult.value = data as unknown as GradingResult;
        phase.value = "graded";
        break;
    }
  };

  ws.onerror = () => {
    wsError.value = "La connexion à l'examinateur virtuel a échoué.";
  };

  ws.onclose = () => {
    stopStreamingMic();
    stopPlaybackAudio();
    const stillActive = ["connecting", "intro", "prep", "live"].includes(
      phase.value,
    );
    if (stillActive) {
      wsError.value = "La connexion à l'examinateur virtuel a été interrompue.";
      phase.value = "error";
    }
  };
}

// Pause de préparation : timer local, non interruptible — la pause est
// requise en entier avant de pouvoir démarrer l'échange. Aucune connexion
// live n'est active côté IA à ce moment (le back a déjà fermé le segment
// d'intro), donc pas de micState/timer_start ici.
function onPrepExpired(): void {
  phase.value = "live";
  timerStarted.value = false;
  sendControlMessage({ type: "prep_done" });
  startStreamingMic();
}

function endSessionNow(): void {
  sendControlMessage({ type: "end_session" });
}

function onLiveExpired(): void {
  endSessionNow();
}

function sendControlMessage(payload: Record<string, unknown>): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
    return;
  }
  wsError.value = "La connexion à l'examinateur virtuel n'est plus active.";
  phase.value = "error";
}

function confirmLeave(): void {
  if (
    phase.value === "live" &&
    !window.confirm(
      "Quitter maintenant abandonnera cette tentative. Continuer ?",
    )
  ) {
    return;
  }
  sendControlMessage({ type: "abandon_session" });
  navigateTo(`/simulateur-oral/${seriesId}`);
}

// ── Capture micro (PCM16 mono 16kHz) ────────────────────────────
let audioContext: AudioContext | null = null;
let micStream: MediaStream | null = null;
let processor: ScriptProcessorNode | null = null;

async function startStreamingMic(): Promise<void> {
  micError.value = null;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  } catch {
    micError.value = "L'accès au microphone est nécessaire pour cette tâche.";
    return;
  }
  micStreamUi.value = micStream;

  audioContext = new AudioContext({ sampleRate: 16000 });
  const source = audioContext.createMediaStreamSource(micStream);

  // ScriptProcessorNode est deprecated mais reste le plus simple à câbler ici ;
  // à remplacer par un AudioWorkletProcessor dédié si la latence devient sensible.
  processor = audioContext.createScriptProcessor(4096, 1, 1);
  processor.onaudioprocess = (e) => {
    if (phase.value !== "live" || !ws || ws.readyState !== WebSocket.OPEN)
      return;
    const input = e.inputBuffer.getChannelData(0);
    const pcm16 = new Int16Array(input.length);

    // Anti-écho : tant que la voix de l'examinatrice sort des haut-parleurs,
    // on envoie du silence (le flux reste continu pour Gemini, mais il
    // n'entend plus sa propre voix captée par le micro).
    if (!isExaminerAudioPlaying()) {
      for (let i = 0; i < input.length; i++) {
        const sample = input[i] ?? 0;
        const s = Math.max(-1, Math.min(1, sample));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
    }
    ws.send(pcm16.buffer);
  };
  source.connect(processor);
  processor.connect(audioContext.destination);
}

function stopStreamingMic(): void {
  processor?.disconnect();
  micStream?.getTracks().forEach((t) => t.stop());
  audioContext?.close();
  processor = null;
  micStream = null;
  audioContext = null;
  micStreamUi.value = null;
}

// ── Lecture audio (PCM16 24kHz, sortie Gemini Live) ─────────────
// Contexte dédié, distinct de celui de capture micro (16kHz en entrée) —
// Gemini Live envoie l'audio de sortie à un taux d'échantillonnage différent.
// File d'attente basée sur nextPlayTime pour enchaîner les chunks sans
// coupure ni chevauchement.
const GEMINI_OUTPUT_SAMPLE_RATE = 24000;
// Marge après la fin de la voix de l'examinatrice (réverbération de la pièce)
const ECHO_TAIL_SECONDS = 0.35;

// Contexte de secours, utilisé seulement si l'avatar 3D n'est pas prêt
let playbackContext: AudioContext | null = null;
let currentTarget: {
  ctx: AudioContext;
  node: AudioNode;
  isAvatar: boolean;
} | null = null;
let nextPlayTime = 0;
const activeSources = new Set<AudioBufferSourceNode>();

function isExaminerAudioPlaying(): boolean {
  if (!currentTarget) return false;
  return nextPlayTime + ECHO_TAIL_SECONDS > currentTarget.ctx.currentTime;
}

function ensureFallbackContext(): AudioContext {
  if (!playbackContext) {
    playbackContext = new AudioContext({
      sampleRate: GEMINI_OUTPUT_SAMPLE_RATE,
    });
  }
  return playbackContext;
}

function getPlaybackTarget() {
  const avatarOut = avatarRef.value?.getAudioOutput() ?? null;

  // On ne bascule vers l'avatar que quand la file en cours est vide,
  // sinon deux contextes joueraient la voix en même temps.
  const queueDrained =
    !currentTarget || nextPlayTime <= currentTarget.ctx.currentTime;

  if (avatarOut && currentTarget?.isAvatar !== true && queueDrained) {
    currentTarget = { ...avatarOut, isAvatar: true };
    nextPlayTime = currentTarget.ctx.currentTime;
  } else if (!currentTarget) {
    const ctx = ensureFallbackContext();
    currentTarget = { ctx, node: ctx.destination, isAvatar: false };
    nextPlayTime = ctx.currentTime;
  }

  if (currentTarget.ctx.state === "suspended") {
    currentTarget.ctx.resume();
  }
  return currentTarget;
}

function playAudioChunk(audioBuffer: ArrayBuffer): void {
  const { ctx, node } = getPlaybackTarget();

  const int16 = new Int16Array(audioBuffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = (int16[i] ?? 0) / 0x8000;
  }

  // 24000 en dur : le contexte de l'avatar tourne à 48000 et rééchantillonne tout seul
  const buffer = ctx.createBuffer(1, float32.length, GEMINI_OUTPUT_SAMPLE_RATE);
  buffer.copyToChannel(float32, 0);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(node);
  activeSources.add(source);
  source.onended = () => activeSources.delete(source);

  const startTime = Math.max(ctx.currentTime, nextPlayTime);
  source.start(startTime);
  nextPlayTime = startTime + buffer.duration;
}

function stopPlaybackAudio(): void {
  // On coupe les sons en cours sans fermer le contexte de l'avatar :
  // c'est le composant 3D qui le libère lui-même.
  activeSources.forEach((s) => {
    try {
      s.stop();
    } catch {
      // déjà terminé
    }
  });
  activeSources.clear();
  playbackContext?.close();
  playbackContext = null;
  currentTarget = null;
  nextPlayTime = 0;
}

function redo(): void {
  window.location.reload();
}

function goToList(): void {
  navigateTo(`/simulateur-oral/${seriesId}`);
}

onBeforeUnmount(() => {
  stopStreamingMic();
  stopPlaybackAudio();
  ws?.close();
});
</script>

<template>
  <div
    class="flex flex-col transition-colors duration-500"
    :class="[
      isCallTheme
        ? 'bg-[radial-gradient(ellipse_at_50%_-10%,var(--p-primary-700)_0%,var(--p-primary-900)_50%,var(--p-primary-950)_100%)] text-white'
        : 'bg-canvas text-ink',
     ['intro', 'prep', 'live'].includes(phase)
  ? 'fixed inset-0 z-50 overflow-hidden'
  : 'min-h-screen',
    ]"
  >
    <!-- Chargement -->
    <div v-if="loadingTask" class="flex flex-1 items-center justify-center">
      <span
        class="grid size-14 place-items-center rounded-leaf brand-gradient text-white shadow-brand"
      >
        <i class="pi pi-spin pi-spinner text-xl" />
      </span>
    </div>

    <!-- Erreur de chargement -->
    <div
      v-else-if="taskError"
      class="flex flex-1 items-center justify-center px-6"
    >
      <div
        class="flex max-w-md items-start gap-3 rounded-card border border-red-200 bg-red-50 p-5 dark:border-red-500/25 dark:bg-red-500/10"
      >
        <i class="pi pi-times-circle mt-0.5 text-red-600 dark:text-red-400" />
        <p class="text-sm font-medium text-red-700 dark:text-red-300">
          {{ taskError }}
        </p>
      </div>
    </div>

    <template v-else-if="task">
      <!-- Barre d'appel -->
      <SimulateurOralCallHeader
        v-if="phase !== 'graded'"
        :title="task.title ?? `Tâche ${task.task_number}`"
        :phase="phase"
        @leave="confirmLeave"
      />

      <!-- Connexion -->
      <div
        v-if="phase === 'connecting'"
        class="flex flex-1 items-center justify-center"
      >
        <div class="flex flex-col items-center gap-5">
          <div class="relative grid size-28 place-items-center">
            <span
              class="absolute inset-0 animate-pulse rounded-full bg-accent-400/15 blur-xl"
            />
            <span
              class="relative grid size-16 place-items-center rounded-full border border-white/15 bg-white/10 backdrop-blur"
            >
              <i class="pi pi-spin pi-spinner text-xl text-accent-300" />
            </span>
          </div>
          <p class="text-sm font-medium tracking-wide text-white/60">
            Connexion à l'examinateur virtuel…
          </p>
        </div>
      </div>

      <!-- Erreur de session -->
      <div
        v-else-if="phase === 'error'"
        class="flex flex-1 items-center justify-center"
      >
        <div class="max-w-lg space-y-4 px-6 text-center">
          <span
            class="mx-auto grid size-14 place-items-center rounded-full border border-red-400/25 bg-red-500/10"
          >
            <i class="pi pi-exclamation-circle text-2xl text-red-300" />
          </span>
          <p class="font-medium text-red-200">
            {{ wsError ?? "Une erreur est survenue pendant la session." }}
          </p>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            @click="goToList"
          >
            <i class="pi pi-arrow-left text-xs" />
            Retour aux sujets
          </button>
        </div>
      </div>

      <!-- Intro / Prep / Live : interface d'appel vidéo -->
      <div
        v-else-if="['intro', 'prep', 'live'].includes(phase)"
        class="flex min-h-0 flex-1 flex-col"
      >
        <div
          class="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 p-4 lg:flex-row"
        >
          <!-- Scène : examinatrice en grand, candidat en vignette -->
          <div class="relative min-h-0 flex-1">
            <SimulateurOralExaminerTile
              ref="avatarRef"
              avatar-url="/avatars/brunette.glb"
              :name="examinerName"
              :speaking="micState === 'agent_speaking'"
              :listening="micState === 'student_turn'"
            />

            <!-- Vignette candidat : positionnée par ce conteneur, pas par le composant -->
            <div
              class="absolute bottom-3 right-3 z-10 h-36 w-28 sm:h-44 sm:w-36"
            >
              <SimulateurOralCandidateTile
                class="h-full w-full"
                :mic-stream="micStreamUi"
                :speaking="micState === 'student_turn'"
                :camera-enabled="cameraEnabled"
                @camera-error="cameraEnabled = false"
              />
            </div>

            <!-- Consigne de préparation -->
            <div
              v-if="phase === 'prep'"
              class="absolute inset-x-3 top-3 z-10 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-center text-sm text-white/80 backdrop-blur-md"
            >
              Préparez-vous en silence. L'échange démarrera automatiquement à la
              fin du minuteur.
            </div>
          </div>

          <!-- Transcription : hauteur bloquée, le contenu défile à l'intérieur -->
          <SimulateurOralTranscriptPanel
            v-if="showTranscript"
            :lines="groupedTranscript"
            class="h-48 shrink-0 lg:h-auto lg:w-80"
          />
        </div>

        <!-- Erreur micro -->
        <div
          v-if="micError"
          class="mx-auto w-full max-w-6xl shrink-0 px-4 pb-3"
        >
          <div
            class="flex items-start gap-2.5 rounded-2xl border border-accent-400/30 bg-accent-400/10 p-3.5 text-sm text-accent-100"
          >
            <i class="pi pi-exclamation-triangle mt-0.5 text-accent-300" />
            {{ micError }}
          </div>
        </div>

        <!-- Barre de contrôle -->
        <SimulateurOralCallControls
          :phase="phase"
          :timer-started="timerStarted"
          :preparation-seconds="preparationTimeSeconds"
          :recording-seconds="recordingTimeSeconds"
          :mic-state="micState"
          :transcript-visible="showTranscript"
          :camera-enabled="cameraEnabled"
          @prep-expired="onPrepExpired"
          @live-expired="onLiveExpired"
          @end="endSessionNow"
          @toggle-transcript="showTranscript = !showTranscript"
          @toggle-camera="cameraEnabled = !cameraEnabled"
        />
      </div>

      <!-- Correction en cours -->
      <div
        v-else-if="phase === 'ended'"
        class="flex flex-1 flex-col items-center justify-center gap-4"
      >
        <div class="flex items-center gap-2.5">
          <span
            class="grid size-8 place-items-center rounded-full border border-white/15 bg-white/5"
          >
            <i class="pi pi-user text-xs text-white/75" />
          </span>
          <div
            class="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-white/10 px-4 py-3.5 backdrop-blur"
          >
            <span class="size-2 animate-bounce rounded-full bg-white/70" />
            <span
              class="size-2 animate-bounce rounded-full bg-white/70 [animation-delay:0.15s]"
            />
            <span
              class="size-2 animate-bounce rounded-full bg-white/70 [animation-delay:0.3s]"
            />
          </div>
        </div>
        <p class="text-sm font-medium text-accent-300">Correction en cours…</p>
      </div>

      <!-- Résultat -->
      <div v-else-if="phase === 'graded' && gradingResult" class="flex-1">
        <!-- En-tête -->
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Retour aux tâches"
              class="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-card text-muted shadow-soft transition-colors hover:border-primary/40 hover:text-primary"
              @click="confirmLeave"
            >
              <i class="pi pi-arrow-left text-sm" />
            </button>
            <div class="min-w-0">
              <p
                class="text-xs font-semibold uppercase tracking-wider text-faint"
              >
                Simulateur oral · Résultat
              </p>
              <h1
                class="truncate font-heading text-xl font-extrabold tracking-tight text-ink sm:text-2xl"
              >
                {{ task.title ?? `Tâche ${task.task_number}` }}
              </h1>
            </div>
          </div>
          <div class="flex gap-2.5">
            <AppButton
              label="Refaire"
              icon="pi pi-refresh"
              variant="secondary"
              @click="redo"
            />
            <AppButton
              label="Autre tâche"
              icon="pi pi-list"
              variant="gradient"
              @click="goToList"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <!-- ── Colonne gauche : score + aperçu ─────────────── -->
          <aside class="lg:col-span-4 xl:col-span-3">
            <div class="flex flex-col gap-4 lg:sticky lg:top-6">
              <!-- Score -->
              <div
                class="relative overflow-hidden rounded-card text-white shadow-brand"
                :class="
                  gradingResult.capped
                    ? 'bg-linear-to-br from-amber-500 to-orange-600'
                    : 'featured-panel'
                "
              >
                <div
                  class="relative z-10 flex flex-col items-center px-6 pb-6 pt-5 text-center"
                >
                  <p
                    class="text-xs font-semibold uppercase tracking-widest text-white/70"
                  >
                    TCF Canada · Tâche {{ gradingResult.task_number }}
                  </p>

                  <!-- Anneau -->
                  <div class="relative my-4 size-36">
                    <svg viewBox="0 0 120 120" class="size-full -rotate-90">
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="rgb(255 255 255 / 0.15)"
                        stroke-width="10"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="10"
                        stroke-linecap="round"
                        class="text-accent-400 transition-[stroke-dasharray] duration-1000 ease-out"
                        :stroke-dasharray="`${Math.min(1, gradingResult.total_score / 20) * 326.7} 326.7`"
                      />
                    </svg>
                    <div
                      class="absolute inset-0 flex flex-col items-center justify-center"
                    >
                      <span
                        class="font-heading text-4xl font-extrabold leading-none tabular-nums"
                      >
                        {{ gradingResult.total_score }}
                      </span>
                      <span class="mt-1 text-sm font-semibold text-white/60"
                        >sur 20</span
                      >
                    </div>
                  </div>

                  <h2 class="font-heading text-xl font-extrabold">
                    {{ gradingResult.capped ? "Plafonné" : "Épreuve terminée" }}
                  </h2>
                </div>

                <div
                  v-if="gradingResult.capped"
                  class="relative z-10 border-t border-white/15 bg-black/10 px-5 py-3.5"
                >
                  <p
                    class="flex items-start gap-2 text-left text-sm text-white/90"
                  >
                    <i class="pi pi-info-circle mt-0.5 shrink-0" />
                    {{ gradingResult.cap_reason }}
                  </p>
                </div>
              </div>

              <!-- Aperçu des critères -->
              <div
                class="rounded-card border border-line bg-card p-4 shadow-soft"
              >
                <p
                  class="mb-3 text-xs font-bold uppercase tracking-wider text-faint"
                >
                  Aperçu
                </p>
                <ul class="space-y-2.5">
                  <li v-for="c in gradingResult.criteria" :key="c.name">
                    <div
                      class="mb-1 flex items-center justify-between gap-2 text-xs"
                    >
                      <span class="truncate font-medium text-muted">{{
                        c.name
                      }}</span>
                      <span
                        class="shrink-0 font-heading font-bold tabular-nums text-ink"
                      >
                        {{ c.score }}<span class="text-faint">/4</span>
                      </span>
                    </div>
                    <div class="h-1.5 overflow-hidden rounded-full bg-line">
                      <div
                        class="h-full rounded-full"
                        :class="
                          c.score / 4 >= 0.75
                            ? 'bg-emerald-500'
                            : c.score / 4 >= 0.5
                              ? 'bg-primary'
                              : 'bg-amber-500'
                        "
                        :style="{
                          width: `${Math.min(100, (c.score / 4) * 100)}%`,
                        }"
                      />
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          <!-- ── Colonne droite : détails ─────────────────────── -->
          <div class="flex flex-col gap-5 lg:col-span-8 xl:col-span-9">
            <!-- Synthèse -->
            <div
              v-if="gradingResult.summary"
              class="flex items-start gap-3 rounded-card border border-primary/15 bg-primary/5 p-4"
            >
              <span
                class="grid size-9 shrink-0 place-items-center rounded-leaf bg-primary/10 text-primary"
              >
                <i class="pi pi-comment" />
              </span>
              <p class="pt-1 text-sm leading-relaxed text-ink">
                {{ gradingResult.summary }}
              </p>
            </div>

            <!-- Critères -->
            <section>
              <h3
                class="mb-3 flex items-center gap-2 font-heading text-sm font-bold text-ink"
              >
                <i class="pi pi-chart-bar text-primary" /> Détail par critère
              </h3>
              <div
                class="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3"
              >
                <article
                  v-for="c in gradingResult.criteria"
                  :key="c.name"
                  class="flex flex-col rounded-2xl border border-line bg-card p-4 shadow-soft"
                >
                  <div class="mb-2 flex items-center justify-between gap-3">
                    <p class="text-sm font-bold text-ink">{{ c.name }}</p>
                    <span
                      class="shrink-0 rounded-full px-2.5 py-0.5 font-heading text-sm font-bold tabular-nums"
                      :class="
                        c.score / 4 >= 0.75
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : c.score / 4 >= 0.5
                            ? 'bg-primary/10 text-primary'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                      "
                    >
                      {{ c.score }}/4
                    </span>
                  </div>
                  <p
                    v-if="c.comment"
                    class="text-[0.8125rem] leading-relaxed text-muted"
                  >
                    {{ c.comment }}
                  </p>
                </article>
              </div>
            </section>

            <!-- Points forts / axes -->
            <div
              v-if="
                gradingResult.strengths.length ||
                gradingResult.improvement_areas.length
              "
              class="grid grid-cols-1 gap-3 md:grid-cols-2"
            >
              <section
                v-if="gradingResult.strengths.length"
                class="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5"
              >
                <p
                  class="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400"
                >
                  <i class="pi pi-check-circle" /> Points forts
                </p>
                <ul class="space-y-2">
                  <li
                    v-for="(s, i) in gradingResult.strengths"
                    :key="i"
                    class="flex items-start gap-2 text-sm leading-relaxed text-ink"
                  >
                    <i
                      class="pi pi-check mt-1 shrink-0 text-xs text-emerald-600 dark:text-emerald-400"
                    />
                    <span>{{ s }}</span>
                  </li>
                </ul>
              </section>

              <section
                v-if="gradingResult.improvement_areas.length"
                class="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-500/5"
              >
                <p
                  class="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400"
                >
                  <i class="pi pi-exclamation-circle" /> Axes d'amélioration
                </p>
                <ul class="space-y-2">
                  <li
                    v-for="(a, i) in gradingResult.improvement_areas"
                    :key="i"
                    class="flex items-start gap-2 text-sm leading-relaxed text-ink"
                  >
                    <i
                      class="pi pi-arrow-up-right mt-1 shrink-0 text-xs text-amber-600 dark:text-amber-400"
                    />
                    <span>{{ a }}</span>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
