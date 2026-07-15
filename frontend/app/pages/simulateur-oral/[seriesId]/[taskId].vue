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
type Phase = "idle" | "connecting" | "intro" | "prep" | "live" | "ended" | "graded" | "error";
const phase = ref<Phase>("idle");

const transcript = ref<{ speaker: "candidat" | "examinateur"; text: string }[]>([]);
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
    const found = (res.data ?? []).find((t) => t.id === taskId && t.type === "oral");
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
        preparationTimeSeconds.value = (data.preparation_time_seconds as number) ?? 0;
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
          speaker: (data.speaker as "candidat" | "examinateur") ?? "examinateur",
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
    const stillActive = ["connecting", "intro", "prep", "live"].includes(phase.value);
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
  if (phase.value === "live" && !window.confirm("Quitter maintenant abandonnera cette tentative. Continuer ?")) {
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
    if (phase.value !== "live" || !ws || ws.readyState !== WebSocket.OPEN) return;
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
    playbackContext = new AudioContext({ sampleRate: GEMINI_OUTPUT_SAMPLE_RATE });
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
    class="min-h-screen flex flex-col transition-colors duration-500"
    :class="isCallTheme
      ? 'bg-[radial-gradient(ellipse_at_50%_-10%,#10534a_0%,#0b2b26_50%,#061412_100%)] text-white'
      : 'bg-slate-50 text-gray-900'"
  >
    <div v-if="loadingTask" class="flex-1 flex items-center justify-center">
      <ProgressSpinner style="width: 40px; height: 40px" />
    </div>
    <div v-else-if="taskError" class="flex-1 flex items-center justify-center px-6 text-center">
      <Message severity="error">{{ taskError }}</Message>
    </div>

    <template v-else-if="task">
      <!-- Barre d'appel sticky -->
      <div
        class="shrink-0 backdrop-blur border-b px-4 py-3 flex items-center gap-3"
        :class="isCallTheme ? 'bg-white/5 border-white/10' : 'bg-white/95 border-gray-200'"
      >
        <Button icon="pi pi-arrow-left" text rounded :class="isCallTheme ? 'text-white!' : ''" @click="confirmLeave" />
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            class="w-2 h-2 rounded-full shrink-0"
            :class="phase === 'live' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'"
          />
          <h1 class="text-sm font-semibold truncate" :class="isCallTheme ? 'text-white/90' : 'text-gray-800'">
            {{ task.title ?? `Tâche ${task.task_number}` }}
          </h1>
        </div>
        <span
          v-if="['intro', 'prep', 'live'].includes(phase)"
          class="ml-auto text-xs font-medium shrink-0 rounded-full px-2.5 py-1"
          :class="isCallTheme ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-400'"
        >
          Mode Examen
        </span>
      </div>

      <!-- Connexion -->
      <div v-if="phase === 'connecting'" class="flex-1 flex items-center justify-center">
        <div class="flex flex-col items-center gap-5">
          <div class="relative w-28 h-28 flex items-center justify-center">
            <span class="absolute inset-0 rounded-full bg-teal-400/10 blur-xl animate-pulse" />
            <div class="relative w-16 h-16 rounded-full bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center">
              <ProgressSpinner style="width: 26px; height: 26px" strokeWidth="4" />
            </div>
          </div>
          <p class="text-sm font-medium text-white/60 tracking-wide">Connexion à l'examinateur virtuel…</p>
        </div>
      </div>

      <!-- Erreur -->
      <div v-else-if="phase === 'error'" class="flex-1 flex items-center justify-center">
        <div class="max-w-lg px-6 text-center space-y-4">
          <div class="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-400/20 flex items-center justify-center">
            <i class="pi pi-exclamation-circle text-red-300 text-2xl" />
          </div>
          <p class="text-red-200 font-medium">{{ wsError ?? "Une erreur est survenue pendant la session." }}</p>
          <Button label="Retour aux sujets" outlined class="border-white/25! text-white!" @click="goToList" />
        </div>
      </div>

      <!-- Intro / Prep / Live : interface d'appel -->
      <div v-else-if="['intro', 'prep', 'live'].includes(phase)" class="flex-1 overflow-y-auto">
        <div class="max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
          <!-- Portraits examinateur / candidat -->
          <div v-if="phase !== 'prep'" class="flex items-center justify-center gap-6 sm:gap-10 pb-2">
            <div
              class="flex flex-col items-center gap-2 transition-opacity duration-300"
              :class="micState === 'student_turn' ? 'opacity-40' : 'opacity-100'"
            >
              <div class="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                <span
                  class="absolute inset-0 rounded-full bg-teal-400/40 blur-md transition-opacity duration-300"
                  :class="micState === 'agent_speaking' ? 'opacity-100 animate-pulse' : 'opacity-0'"
                />
                <span
                  class="absolute inset-0 rounded-full border-2 transition-colors duration-300"
                  :class="micState === 'agent_speaking' ? 'border-teal-300/70' : 'border-white/10'"
                />
                <div class="relative w-[88%] h-[88%] rounded-full bg-linear-to-b from-[#173a35] to-[#0c211d] flex items-center justify-center">
                  <i class="pi pi-user text-3xl text-white/70" />
                </div>
              </div>
              <p class="text-xs font-medium text-white/60 tracking-wide">Examinateur</p>
            </div>

            <div
              class="flex flex-col items-center gap-2 transition-opacity duration-300"
              :class="micState === 'agent_speaking' ? 'opacity-40' : 'opacity-100'"
            >
              <div class="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                <span
                  class="absolute inset-0 rounded-full bg-emerald-300/35 blur-md transition-opacity duration-300"
                  :class="micState === 'student_turn' ? 'opacity-100 animate-pulse' : 'opacity-0'"
                />
                <span
                  class="absolute inset-0 rounded-full border-2 transition-colors duration-300"
                  :class="micState === 'student_turn' ? 'border-emerald-300/70' : 'border-white/10'"
                />
                <div class="relative w-[88%] h-[88%] rounded-full bg-linear-to-b from-[#173a35] to-[#0c211d] flex items-center justify-center">
                  <i class="pi pi-microphone text-3xl text-white/70" />
                </div>
              </div>
              <p class="text-xs font-medium text-white/60 tracking-wide">Vous</p>
            </div>
          </div>
          <p v-if="phase !== 'prep'" class="text-center text-xs text-white/40 uppercase tracking-widest -mt-3">
            {{ micLabel }}
          </p>

          <!-- Chrono officiel : n'apparaît qu'après timer_start -->
          <div v-if="phase === 'live' && timerStarted" class="flex items-center justify-center gap-3">
            <ExamTimer :total-seconds="recordingTimeSeconds" @expired="onLiveExpired" />
            <Button label="Terminer" severity="secondary" outlined class="border-white/25! text-white!" @click="endSessionNow" />
          </div>
          <p v-else-if="phase === 'live'" class="text-center text-xs text-white/40">
            Le chronomètre démarre après la présentation de l'examinateur…
          </p>

          <!-- Pause de préparation -->
          <div v-if="phase === 'prep'" class="flex flex-col items-center gap-4 py-6">
            <ExamTimer :total-seconds="preparationTimeSeconds" @expired="onPrepExpired" />
            <span class="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white/70 border border-white/10">
              <i class="pi pi-pause-circle" /> Pause — pas d'enregistrement
            </span>
            <p class="text-sm text-white/60 text-center max-w-md">
              Préparez-vous en silence. L'échange démarrera automatiquement à la fin du minuteur.
            </p>
          </div>

          <Message v-if="micError" severity="warn">{{ micError }}</Message>

          <!-- Fil de discussion -->
          <div class="space-y-3 py-2">
            <div
              v-for="(line, i) in groupedTranscript"
              :key="i"
              class="flex items-end gap-2"
              :class="line.speaker === 'candidat' ? 'flex-row-reverse' : 'flex-row'"
            >
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border"
                :class="line.speaker === 'candidat' ? 'border-emerald-300/30 bg-emerald-900/30' : 'border-white/15 bg-white/5'"
              >
                <i :class="line.speaker === 'candidat' ? 'pi pi-microphone' : 'pi pi-user'" class="text-xs text-white/70" />
              </div>
              <div
                class="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                :class="line.speaker === 'candidat'
                  ? 'bg-linear-to-br from-[#eafaf5] to-[#d3f1e8] text-[#0b2420] rounded-br-sm shadow-md shadow-black/20'
                  : 'bg-white/10 border border-white/10 backdrop-blur text-white/85 rounded-bl-sm'"
              >
                {{ line.text }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Correction en cours -->
      <div v-else-if="phase === 'ended'" class="flex-1 flex flex-col items-center justify-center gap-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full flex items-center justify-center border border-white/15 bg-white/5">
            <i class="pi pi-user text-xs text-white/70" />
          </div>
          <div class="bg-white/8 border border-white/10 backdrop-blur rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
            <span class="typing-dot" />
            <span class="typing-dot" style="animation-delay: 0.15s" />
            <span class="typing-dot" style="animation-delay: 0.3s" />
          </div>
        </div>
        <p class="text-sm font-medium text-teal-300/80">Correction en cours…</p>
      </div>

      <!-- Résultat -->
      <div v-else-if="phase === 'graded' && gradingResult" class="flex-1 overflow-y-auto">
        <div class="max-w-2xl mx-auto px-4 py-8 space-y-5">
          <div class="rounded-2xl overflow-hidden shadow-sm" :class="gradingResult.capped ? 'bg-orange-500' : 'bg-green-600'">
            <div class="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
              <div>
                <p class="text-xs text-white/70 font-semibold uppercase tracking-widest mb-1">
                  TCF Canada · Tâche {{ gradingResult.task_number }}
                </p>
                <h1 class="text-2xl font-bold text-white">
                  {{ gradingResult.capped ? "Plafonné" : "Épreuve terminée" }}
                </h1>
              </div>
              <div class="text-white text-right shrink-0">
                <p class="text-2xl font-bold leading-none">{{ gradingResult.total_score }}/20</p>
              </div>
            </div>
            <div v-if="gradingResult.capped" class="px-6 py-4 bg-black/10 border-t border-white/10">
              <p class="text-sm text-white/90">{{ gradingResult.cap_reason }}</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div class="px-5 py-4 border-b border-gray-100">
              <h2 class="font-semibold text-gray-800 text-sm">Détail par critère</h2>
            </div>
            <div class="divide-y divide-gray-100">
              <div v-for="c in gradingResult.criteria" :key="c.name" class="px-5 py-4">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">{{ c.name }}</span>
                  <span class="text-xs text-gray-400">{{ c.score }}/4</span>
                </div>
                <p v-if="c.comment" class="text-xs text-gray-500">{{ c.comment }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-if="gradingResult.strengths.length">
              <p class="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <i class="pi pi-check-circle" /> Points forts
              </p>
              <ul class="space-y-1.5">
                <li v-for="(s, i) in gradingResult.strengths" :key="i" class="flex items-start gap-2 text-sm text-gray-700 bg-green-50 rounded-lg px-3 py-2">
                  <i class="pi pi-check text-green-500 mt-0.5 shrink-0 text-xs" />
                  <span>{{ s }}</span>
                </li>
              </ul>
            </div>
            <div v-if="gradingResult.improvement_areas.length">
              <p class="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <i class="pi pi-exclamation-circle" /> Axes d'amélioration
              </p>
              <ul class="space-y-1.5">
                <li v-for="(a, i) in gradingResult.improvement_areas" :key="i" class="flex items-start gap-2 text-sm text-gray-700 bg-orange-50 rounded-lg px-3 py-2">
                  <i class="pi pi-times text-orange-400 mt-0.5 shrink-0 text-xs" />
                  <span>{{ a }}</span>
                </li>
              </ul>
            </div>
          </div>

          <p v-if="gradingResult.summary" class="text-sm text-gray-600 italic">{{ gradingResult.summary }}</p>

          <div class="flex gap-3 pb-8">
            <Button label="Refaire" icon="pi pi-refresh" outlined class="flex-1" @click="redo" />
            <Button label="Choisir une autre tâche" icon="pi pi-list" class="flex-1" @click="goToList" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.5);
  display: inline-block;
  animation: typing-bounce 1s infinite ease-in-out;
}
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-4px); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .typing-dot {
    animation: none !important;
  }
}
</style>