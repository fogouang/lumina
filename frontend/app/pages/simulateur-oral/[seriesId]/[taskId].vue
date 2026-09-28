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

const micLabel = computed(() => {
  if (micState.value === "agent_speaking") return "L'examinateur parle…";
  if (micState.value === "student_turn") return "À vous de parler";
  return "";
});

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
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    micError.value = "L'accès au microphone est nécessaire pour cette tâche.";
    return;
  }

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
    for (let i = 0; i < input.length; i++) {
      const sample = input[i] ?? 0;
      const s = Math.max(-1, Math.min(1, sample));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
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
}

// ── Lecture audio (PCM16 24kHz, sortie Gemini Live) ─────────────
// Contexte dédié, distinct de celui de capture micro (16kHz en entrée) —
// Gemini Live envoie l'audio de sortie à un taux d'échantillonnage différent.
// File d'attente basée sur nextPlayTime pour enchaîner les chunks sans
// coupure ni chevauchement.
const GEMINI_OUTPUT_SAMPLE_RATE = 24000;
let playbackContext: AudioContext | null = null;
let nextPlayTime = 0;

function ensurePlaybackContext(): AudioContext {
  if (!playbackContext) {
    playbackContext = new AudioContext({
      sampleRate: GEMINI_OUTPUT_SAMPLE_RATE,
    });
    nextPlayTime = playbackContext.currentTime;
  }
  if (playbackContext.state === "suspended") {
    playbackContext.resume();
  }
  return playbackContext;
}

function playAudioChunk(audioBuffer: ArrayBuffer): void {
  const ctx = ensurePlaybackContext();
  const int16 = new Int16Array(audioBuffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = (int16[i] ?? 0) / 0x8000;
  }

  const buffer = ctx.createBuffer(1, float32.length, GEMINI_OUTPUT_SAMPLE_RATE);
  buffer.copyToChannel(float32, 0);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);

  const startTime = Math.max(ctx.currentTime, nextPlayTime);
  source.start(startTime);
  nextPlayTime = startTime + buffer.duration;
}

function stopPlaybackAudio(): void {
  playbackContext?.close();
  playbackContext = null;
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
    class="flex min-h-screen flex-col transition-colors duration-500"
    :class="
      isCallTheme
        ? 'bg-[radial-gradient(ellipse_at_50%_-10%,var(--p-primary-700)_0%,var(--p-primary-900)_50%,var(--p-primary-950)_100%)] text-white'
        : 'bg-canvas text-ink'
    "
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
      <div
        class="flex shrink-0 items-center gap-3 border-b px-4 py-3 backdrop-blur-md"
        :class="
          isCallTheme ? 'border-white/10 bg-white/5' : 'border-line bg-card/90'
        "
      >
        <button
          type="button"
          aria-label="Quitter la simulation"
          class="grid size-9 shrink-0 place-items-center rounded-xl transition-colors"
          :class="
            isCallTheme
              ? 'text-white/80 hover:bg-white/10 hover:text-white'
              : 'text-muted hover:bg-card-2 hover:text-primary'
          "
          @click="confirmLeave"
        >
          <i class="pi pi-arrow-left text-sm" />
        </button>
        <div class="flex min-w-0 flex-1 items-center gap-2.5">
          <span
            class="size-2 shrink-0 rounded-full"
            :class="
              phase === 'live'
                ? 'animate-pulse bg-red-500 shadow-[0_0_0_4px_rgb(239_68_68/0.25)]'
                : 'bg-white/30'
            "
          />
          <h1
            class="truncate font-heading text-sm font-bold"
            :class="isCallTheme ? 'text-white/90' : 'text-ink'"
          >
            {{ task.title ?? `Tâche ${task.task_number}` }}
          </h1>
        </div>
        <span
          v-if="['intro', 'prep', 'live'].includes(phase)"
          class="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
          :class="
            isCallTheme ? 'bg-white/10 text-white/70' : 'bg-card-2 text-muted'
          "
        >
          <i class="pi pi-shield text-[0.65rem]" />
          Mode Examen
        </span>
      </div>

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

      <!-- Intro / Prep / Live : interface d'appel -->
      <div
        v-else-if="['intro', 'prep', 'live'].includes(phase)"
        class="flex-1 overflow-y-auto"
      >
        <div class="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
          <!-- Portraits -->
          <div
            v-if="phase !== 'prep'"
            class="flex items-center justify-center gap-8 pb-2 sm:gap-14"
          >
            <!-- Examinateur -->
            <div
              class="flex flex-col items-center gap-2 transition-opacity duration-300"
              :class="
                micState === 'student_turn' ? 'opacity-40' : 'opacity-100'
              "
            >
              <div class="relative grid size-24 place-items-center sm:size-28">
                <span
                  class="absolute inset-0 rounded-full bg-accent-400/35 blur-md transition-opacity duration-300"
                  :class="
                    micState === 'agent_speaking'
                      ? 'animate-pulse opacity-100'
                      : 'opacity-0'
                  "
                />
                <span
                  class="absolute inset-0 rounded-full border-2 transition-colors duration-300"
                  :class="
                    micState === 'agent_speaking'
                      ? 'border-accent-300/80'
                      : 'border-white/10'
                  "
                />
                <span
                  class="relative grid size-[88%] place-items-center rounded-full bg-linear-to-b from-primary-700 to-primary-900 shadow-[inset_0_2px_0_rgb(255_255_255/0.1)]"
                >
                  <i class="pi pi-user text-3xl text-white/75" />
                </span>
              </div>
              <p class="text-xs font-semibold tracking-wide text-white/60">
                Examinateur
              </p>
            </div>

            <!-- Candidat -->
            <div
              class="flex flex-col items-center gap-2 transition-opacity duration-300"
              :class="
                micState === 'agent_speaking' ? 'opacity-40' : 'opacity-100'
              "
            >
              <div class="relative grid size-24 place-items-center sm:size-28">
                <span
                  class="absolute inset-0 rounded-full bg-emerald-300/35 blur-md transition-opacity duration-300"
                  :class="
                    micState === 'student_turn'
                      ? 'animate-pulse opacity-100'
                      : 'opacity-0'
                  "
                />
                <span
                  class="absolute inset-0 rounded-full border-2 transition-colors duration-300"
                  :class="
                    micState === 'student_turn'
                      ? 'border-emerald-300/80'
                      : 'border-white/10'
                  "
                />
                <span
                  class="relative grid size-[88%] place-items-center rounded-full bg-linear-to-b from-primary-700 to-primary-900 shadow-[inset_0_2px_0_rgb(255_255_255/0.1)]"
                >
                  <i class="pi pi-microphone text-3xl text-white/75" />
                </span>
              </div>
              <p class="text-xs font-semibold tracking-wide text-white/60">
                Vous
              </p>
            </div>
          </div>
          <p
            v-if="phase !== 'prep'"
            class="-mt-3 text-center text-xs uppercase tracking-widest text-white/45"
          >
            {{ micLabel }}
          </p>

          <!-- Chrono officiel -->
          <div
            v-if="phase === 'live' && timerStarted"
            class="flex items-center justify-center gap-3"
          >
            <ExamTimer
              :total-seconds="recordingTimeSeconds"
              @expired="onLiveExpired"
            />
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              @click="endSessionNow"
            >
              <i class="pi pi-stop-circle text-xs" />
              Terminer
            </button>
          </div>
          <p
            v-else-if="phase === 'live'"
            class="text-center text-xs text-white/45"
          >
            Le chronomètre démarre après la présentation de l'examinateur…
          </p>

          <!-- Préparation -->
          <div
            v-if="phase === 'prep'"
            class="flex flex-col items-center gap-4 py-6"
          >
            <ExamTimer
              :total-seconds="preparationTimeSeconds"
              @expired="onPrepExpired"
            />
            <span
              class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/75"
            >
              <i class="pi pi-pause-circle" /> Pause · pas d'enregistrement
            </span>
            <p class="max-w-md text-center text-sm text-white/60">
              Préparez-vous en silence. L'échange démarrera automatiquement à la
              fin du minuteur.
            </p>
          </div>

          <!-- Erreur micro -->
          <div
            v-if="micError"
            class="flex items-start gap-2.5 rounded-2xl border border-accent-400/30 bg-accent-400/10 p-3.5 text-sm text-accent-100"
          >
            <i class="pi pi-exclamation-triangle mt-0.5 text-accent-300" />
            {{ micError }}
          </div>

          <!-- Fil de discussion -->
          <div class="space-y-3 py-2">
            <div
              v-for="(line, i) in groupedTranscript"
              :key="i"
              class="flex items-end gap-2"
              :class="
                line.speaker === 'candidat' ? 'flex-row-reverse' : 'flex-row'
              "
            >
              <span
                class="grid size-7 shrink-0 place-items-center rounded-full border"
                :class="
                  line.speaker === 'candidat'
                    ? 'border-emerald-300/30 bg-emerald-500/15'
                    : 'border-white/15 bg-white/5'
                "
              >
                <i
                  :class="
                    line.speaker === 'candidat'
                      ? 'pi pi-microphone'
                      : 'pi pi-user'
                  "
                  class="text-xs text-white/75"
                />
              </span>
              <div
                class="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                :class="
                  line.speaker === 'candidat'
                    ? 'rounded-br-sm bg-white text-primary-950 shadow-md shadow-black/25'
                    : 'rounded-bl-sm border border-white/10 bg-white/10 text-white/85 backdrop-blur'
                "
              >
                {{ line.text }}
              </div>
            </div>
          </div>
        </div>
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
      <div
        v-else-if="phase === 'graded' && gradingResult"
        class="flex-1 overflow-y-auto"
      >
        <div class="mx-auto max-w-2xl space-y-5 px-4 py-8">
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
              class="relative z-10 flex items-start justify-between gap-4 px-6 pb-5 pt-6"
            >
              <div>
                <p
                  class="mb-1 text-xs font-semibold uppercase tracking-widest text-white/70"
                >
                  TCF Canada · Tâche {{ gradingResult.task_number }}
                </p>
                <h2 class="font-heading text-2xl font-extrabold">
                  {{ gradingResult.capped ? "Plafonné" : "Épreuve terminée" }}
                </h2>
              </div>
              <p
                class="shrink-0 font-heading text-4xl font-extrabold leading-none tabular-nums"
              >
                {{ gradingResult.total_score
                }}<span class="text-lg opacity-60">/20</span>
              </p>
            </div>
            <div
              v-if="gradingResult.capped"
              class="relative z-10 border-t border-white/15 bg-black/10 px-6 py-4"
            >
              <p class="flex items-start gap-2 text-sm text-white/90">
                <i class="pi pi-info-circle mt-0.5 shrink-0" />
                {{ gradingResult.cap_reason }}
              </p>
            </div>
          </div>

          <!-- Critères -->
          <section
            class="overflow-hidden rounded-card border border-line bg-card shadow-soft"
          >
            <h3
              class="flex items-center gap-2 border-b border-line px-5 py-4 font-heading text-sm font-bold text-ink"
            >
              <i class="pi pi-chart-bar text-primary" /> Détail par critère
            </h3>
            <div class="divide-y divide-line">
              <div
                v-for="c in gradingResult.criteria"
                :key="c.name"
                class="px-5 py-4"
              >
                <div class="mb-1.5 flex items-center justify-between gap-3">
                  <span class="text-sm font-semibold text-ink">{{
                    c.name
                  }}</span>
                  <span
                    class="font-heading text-sm font-bold tabular-nums text-primary"
                  >
                    {{ c.score
                    }}<span class="text-xs font-semibold text-faint">/4</span>
                  </span>
                </div>
                <div class="mb-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    class="h-full rounded-full bg-linear-to-r from-primary-400 to-primary-700"
                    :style="{ width: `${Math.min(100, (c.score / 4) * 100)}%` }"
                  />
                </div>
                <p v-if="c.comment" class="text-xs leading-relaxed text-muted">
                  {{ c.comment }}
                </p>
              </div>
            </div>
          </section>

          <!-- Points forts / axes -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div v-if="gradingResult.strengths.length">
              <p
                class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400"
              >
                <i class="pi pi-check-circle" /> Points forts
              </p>
              <ul class="space-y-1.5">
                <li
                  v-for="(s, i) in gradingResult.strengths"
                  :key="i"
                  class="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-ink dark:border-emerald-500/20 dark:bg-emerald-500/10"
                >
                  <i
                    class="pi pi-check mt-0.5 shrink-0 text-xs text-emerald-600 dark:text-emerald-400"
                  />
                  <span>{{ s }}</span>
                </li>
              </ul>
            </div>
            <div v-if="gradingResult.improvement_areas.length">
              <p
                class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400"
              >
                <i class="pi pi-exclamation-circle" /> Axes d'amélioration
              </p>
              <ul class="space-y-1.5">
                <li
                  v-for="(a, i) in gradingResult.improvement_areas"
                  :key="i"
                  class="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-ink dark:border-amber-500/20 dark:bg-amber-500/10"
                >
                  <i
                    class="pi pi-arrow-up-right mt-0.5 shrink-0 text-xs text-amber-600 dark:text-amber-400"
                  />
                  <span>{{ a }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Synthèse -->
          <p
            v-if="gradingResult.summary"
            class="rounded-2xl border-l-4 border-primary bg-card-2 px-4 py-3 text-sm italic leading-relaxed text-muted"
          >
            {{ gradingResult.summary }}
          </p>

          <!-- Actions -->
          <div class="flex flex-col gap-3 pb-8 sm:flex-row">
            <AppButton
              label="Refaire"
              icon="pi pi-refresh"
              variant="secondary"
              class="flex-1"
              @click="redo"
            />
            <AppButton
              label="Choisir une autre tâche"
              icon="pi pi-list"
              variant="gradient"
              class="flex-1"
              @click="goToList"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
