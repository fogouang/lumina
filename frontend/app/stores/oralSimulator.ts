import { defineStore } from "pinia";

// ── Types ──────────────────────────────────────────────────────
// À ajuster une fois le contrat back confirmé (endpoints /v1/expression-orale/*)

export type TaskNumber = 1 | 2 | 3;

export type TaskPhase =
  | "idle" // rien n'a commencé
  | "prep" // uniquement pour la tâche 2 (2 min de brouillon, pas d'appel IA)
  | "connecting" // ouverture de la session Gemini Live
  | "live" // échange en cours
  | "ended"; // session terminée, en attente de correction

export interface TranscriptEntry {
  role: "candidat" | "examinateur";
  text: string;
  timestamp: number;
}

export interface OralSubject {
  id: number;
  task: TaskNumber;
  // Tâche 1: pas de contenu particulier, juste les thèmes génériques
  // Tâche 2: scénario de jeu de rôle
  scenario?: string; // ex: "Vous partez en vacances... Je vous propose ma candidature."
  role_candidat?: string; // ex: "vous"
  role_interlocuteur?: string; // ex: "un ami"
  keywords?: string[]; // mots-clés entre parenthèses dans la consigne
  // Tâche 3: la question posée par l'examinateur
  question?: string;
}

const TASK_DURATIONS_SECONDS: Record<TaskNumber, { prep: number; live: number }> = {
  1: { prep: 0, live: 120 },
  2: { prep: 120, live: 210 },
  3: { prep: 0, live: 270 },
};

export const useOralSimulatorStore = defineStore("oralSimulator", () => {
  // ── State ────────────────────────────────────────────────────
  const seriesNumber = ref<number | null>(null);
  const currentTask = ref<TaskNumber | null>(null);
  const phase = ref<TaskPhase>("idle");
  const subject = ref<OralSubject | null>(null);

  const prepSecondsLeft = ref(0);
  const liveSecondsElapsed = ref(0);

  const draftNotes = ref(""); // brouillon libre pendant la prep (tâche 2)
  const transcript = ref<TranscriptEntry[]>([]);

  const error = ref<string | null>(null);

  let prepTimer: ReturnType<typeof setInterval> | null = null;
  let liveTimer: ReturnType<typeof setInterval> | null = null;
  let ws: WebSocket | null = null;

  // ── Getters ──────────────────────────────────────────────────
  const liveSecondsRemaining = computed(() => {
    if (!currentTask.value) return 0;
    return Math.max(
      0,
      TASK_DURATIONS_SECONDS[currentTask.value].live - liveSecondsElapsed.value,
    );
  });

  const isNearingEnd = computed(() => liveSecondsRemaining.value <= 15);

  // ── Actions ──────────────────────────────────────────────────
  function clearTimers(): void {
    if (prepTimer) clearInterval(prepTimer);
    if (liveTimer) clearInterval(liveTimer);
    prepTimer = null;
    liveTimer = null;
  }

  async function loadTask(
    series: number,
    task: TaskNumber,
    fetchedSubject: OralSubject,
  ): Promise<void> {
    seriesNumber.value = series;
    currentTask.value = task;
    subject.value = fetchedSubject;
    transcript.value = [];
    draftNotes.value = "";
    error.value = null;

    const durations = TASK_DURATIONS_SECONDS[task];
    if (durations.prep > 0) {
      startPrepPhase(durations.prep);
    } else {
      phase.value = "idle"; // prêt à démarrer directement l'échange live
    }
  }

  function startPrepPhase(seconds: number): void {
    phase.value = "prep";
    prepSecondsLeft.value = seconds;
    prepTimer = setInterval(() => {
      prepSecondsLeft.value -= 1;
      if (prepSecondsLeft.value <= 0) {
        clearTimers();
        phase.value = "idle"; // prep terminée, prêt à lancer l'échange
      }
    }, 1000);
  }

  async function connectLiveSession(): Promise<void> {
    if (!currentTask.value || !seriesNumber.value) return;
    phase.value = "connecting";
    error.value = null;

    try {
      // TODO: adapter l'URL/le protocole au endpoint FastAPI réel une fois exposé
      // (WS relay vers Gemini Live, un segment par tâche — cf. pattern GoToGermany)
      const config = useRuntimeConfig();
      const wsUrl =
        `${config.public.wsBaseUrl}/v1/expression-orale/sessions/live` +
        `?series=${seriesNumber.value}&task=${currentTask.value}`;

      ws = new WebSocket(wsUrl);
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        phase.value = "live";
        liveSecondsElapsed.value = 0;
        liveTimer = setInterval(() => {
          liveSecondsElapsed.value += 1;
          if (liveSecondsRemaining.value <= 0) {
            endSession();
          }
        }, 1000);
      };

      ws.onmessage = (event) => {
        // TODO: adapter au format réel des messages serveur
        // (transcript incrémental + audio en base64, cf. Gemini Live server messages)
        try {
          const data = JSON.parse(event.data);
          if (data.type === "transcript") {
            transcript.value.push({
              role: data.role,
              text: data.text,
              timestamp: Date.now(),
            });
          }
          if (data.type === "audio") {
            playAudioChunk(data.audio_base64);
          }
        } catch {
          // message binaire brut, à gérer selon le protocole final
        }
      };

      ws.onerror = () => {
        error.value = "La connexion à l'examinateur virtuel a échoué.";
        phase.value = "idle";
      };

      ws.onclose = () => {
        if (phase.value === "live") {
          phase.value = "ended";
        }
      };
    } catch (err) {
      error.value = "Impossible de démarrer la session.";
      phase.value = "idle";
    }
  }

  function playAudioChunk(_audioBase64: string): void {
    // TODO: brancher sur un AudioContext / lecteur PCM en streaming
  }

  function sendMicChunk(_pcmChunk: ArrayBuffer): void {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(_pcmChunk);
    }
  }

  function endSession(): void {
    clearTimers();
    if (ws) {
      ws.close();
      ws = null;
    }
    phase.value = "ended";
  }

  function $reset(): void {
    clearTimers();
    if (ws) {
      ws.close();
      ws = null;
    }
    seriesNumber.value = null;
    currentTask.value = null;
    phase.value = "idle";
    subject.value = null;
    prepSecondsLeft.value = 0;
    liveSecondsElapsed.value = 0;
    draftNotes.value = "";
    transcript.value = [];
    error.value = null;
  }

  return {
    seriesNumber,
    currentTask,
    phase,
    subject,
    prepSecondsLeft,
    liveSecondsElapsed,
    liveSecondsRemaining,
    isNearingEnd,
    draftNotes,
    transcript,
    error,
    loadTask,
    connectLiveSession,
    sendMicChunk,
    endSession,
    $reset,
  };
});