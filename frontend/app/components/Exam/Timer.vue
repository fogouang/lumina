<template>
  <div
    class="rounded-card border p-4 shadow-soft transition-colors duration-500"
    :class="
      isCritical
        ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950'
        : isWarning
          ? 'border-accent-300 bg-accent-50 dark:border-accent-900 dark:bg-accent-950'
          : 'border-line bg-card'
    "
    role="timer"
    aria-live="off"
  >
    <div class="flex items-center gap-3">
      <span
        class="grid size-11 shrink-0 place-items-center rounded-leaf transition-colors duration-500"
        :class="
          isCritical
            ? 'animate-pulse bg-red-500 text-white'
            : isWarning
              ? 'bg-accent-400 text-accent-950'
              : 'brand-gradient text-white shadow-brand'
        "
      >
        <i class="pi pi-clock" />
      </span>
      <div>
        <p
          class="font-mono text-2xl font-bold tabular-nums leading-none"
          :class="isCritical ? 'text-red-600 dark:text-red-400' : 'text-ink'"
        >
          {{ formattedTime }}
        </p>
        <p class="mt-1 text-xs text-faint">Temps restant</p>
      </div>
    </div>

    <div class="mt-3.5 h-1.5 overflow-hidden rounded-full bg-card-2">
      <div
        class="h-full rounded-full transition-[width] duration-1000 ease-linear"
        :class="isCritical ? 'bg-red-500' : isWarning ? 'bg-accent-400' : 'brand-gradient'"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  totalSeconds: number  // durée totale en secondes
}>()

const emit = defineEmits<{
  expired: []
}>()

const timeLeft = ref(props.totalSeconds)

const isWarning  = computed(() => timeLeft.value < 300 && timeLeft.value >= 60)  // < 5min
const isCritical = computed(() => timeLeft.value < 60)                            // < 1min
const percent    = computed(() => Math.round((timeLeft.value / props.totalSeconds) * 100))

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