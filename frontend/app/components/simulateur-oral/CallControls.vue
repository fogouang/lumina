<script setup lang="ts">
const props = defineProps<{
  phase: string
  timerStarted: boolean
  preparationSeconds: number
  recordingSeconds: number
  micState: 'agent_speaking' | 'student_turn' | null
  transcriptVisible: boolean
  cameraEnabled: boolean
}>()

const emit = defineEmits<{
  'prep-expired': []
  'live-expired': []
  end: []
  'toggle-transcript': []
  'toggle-camera': []
}>()

const status = computed(() => {
  if (props.phase === 'prep') {
    return { label: "Préparation · pas d'enregistrement", icon: 'pi pi-pause-circle', tone: 'neutral' }
  }
  if (props.phase === 'intro') {
    return { label: 'Lecture de la consigne', icon: 'pi pi-volume-up', tone: 'examiner' }
  }
  if (props.micState === 'agent_speaking') {
    return { label: "L'examinatrice parle", icon: 'pi pi-volume-up', tone: 'examiner' }
  }
  if (props.micState === 'student_turn') {
    return { label: 'À vous de parler', icon: 'pi pi-microphone', tone: 'candidate' }
  }
  return { label: 'En attente', icon: 'pi pi-clock', tone: 'neutral' }
})

const statusClass = computed(() => {
  if (status.value.tone === 'examiner') return 'bg-accent-400/15 text-accent-200'
  if (status.value.tone === 'candidate') return 'bg-emerald-400/15 text-emerald-200'
  return 'bg-white/10 text-white/70'
})
</script>

<template>
  <div class="shrink-0 border-t border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
    <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
      <!-- Statut -->
      <span
        class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
        :class="statusClass"
      >
        <i :class="status.icon" class="text-[0.7rem]" />
        {{ status.label }}
      </span>

      <!-- Chrono -->
      <div class="flex items-center">
        <ExamTimer
          v-if="phase === 'prep'"
          :total-seconds="preparationSeconds"
          @expired="emit('prep-expired')"
        />
        <ExamTimer
          v-else-if="phase === 'live' && timerStarted"
          :total-seconds="recordingSeconds"
          @expired="emit('live-expired')"
        />
        <span v-else-if="phase === 'live'" class="text-xs text-white/50">
          Le chrono démarre après la présentation…
        </span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          :aria-label="cameraEnabled ? 'Couper ma caméra' : 'Activer ma caméra'"
          class="grid size-10 place-items-center rounded-full border transition-colors"
          :class="
            cameraEnabled
              ? 'border-white/25 bg-white/15 text-white'
              : 'border-white/15 text-white/70 hover:bg-white/10'
          "
          @click="emit('toggle-camera')"
        >
          <i :class="cameraEnabled ? 'pi pi-video' : 'pi pi-eye-slash'" class="text-sm" />
        </button>

        <button
          type="button"
          :aria-label="transcriptVisible ? 'Masquer la transcription' : 'Afficher la transcription'"
          class="grid size-10 place-items-center rounded-full border transition-colors"
          :class="
            transcriptVisible
              ? 'border-white/25 bg-white/15 text-white'
              : 'border-white/15 text-white/70 hover:bg-white/10'
          "
          @click="emit('toggle-transcript')"
        >
          <i class="pi pi-align-left text-sm" />
        </button>

        <button
          v-if="phase === 'live'"
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition-colors hover:bg-red-600"
          @click="emit('end')"
        >
          <i class="pi pi-stop-circle text-xs" />
          Terminer
        </button>
      </div>
    </div>
  </div>
</template>