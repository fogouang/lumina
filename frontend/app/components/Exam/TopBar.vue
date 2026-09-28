<template>
  <div class="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-card/90 px-4 py-2.5 backdrop-blur-md">
    <!-- Chrono -->
    <div
      class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-sm font-bold tabular-nums transition-colors duration-500"
      :class="
        isCritical
          ? 'animate-pulse bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
          : isWarning
            ? 'bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300'
            : 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
      "
    >
      <i class="pi pi-clock text-xs" />
      {{ formattedTime }}
    </div>

    <!-- Compteurs -->
    <div class="flex flex-1 items-center justify-center gap-2 text-sm">
      <span class="font-heading font-bold text-ink">{{ currentIndex + 1 }}/{{ total }}</span>
      <span class="text-faint">·</span>
      <span class="inline-flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
        <i class="pi pi-check text-[0.65rem]" />
        {{ answeredCount }}/{{ total }}
      </span>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1">
      <button
        type="button"
        aria-label="Voir toutes les questions"
        class="grid size-10 place-items-center rounded-xl text-muted transition-colors hover:bg-card-2 hover:text-ink"
        @click="emit('openNav')"
      >
        <i class="pi pi-th-large" />
      </button>
      <button
        type="button"
        aria-label="Quitter l'examen"
        class="grid size-10 place-items-center rounded-xl text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
        @click="emit('quit')"
      >
        <i class="pi pi-sign-out" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  totalSeconds:  number
  currentIndex:  number
  total:         number
  answeredCount: number
}>()

const emit = defineEmits<{
  openNav: []
  quit:    []
  expired: []
}>()

const timeLeft = ref(props.totalSeconds)

const isWarning  = computed(() => timeLeft.value < 300 && timeLeft.value >= 60)
const isCritical = computed(() => timeLeft.value < 60)

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
  const s = (timeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

let interval: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(() => {
    if (timeLeft.value <= 0) {
      clearInterval(interval)
      emit('expired')
      return
    }
    timeLeft.value--
  }, 1000)
})

onUnmounted(() => clearInterval(interval))
</script>