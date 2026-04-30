<template>
  <div class="timer" :class="{ 'timer--warning': isWarning, 'timer--critical': isCritical }">
    <div class="timer__top">
      <i class="pi pi-clock timer__icon" />
      <span class="timer__time">{{ formattedTime }}</span>
    </div>
    <p class="timer__label">Temps restant</p>
    <ProgressBar :value="percent" class="timer__bar" :pt="{ value: { class: 'timer__bar-fill' } }" />
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

<style scoped>
.timer {
  background: var(--gradient-primary);
  border-radius: 0.875rem;
  padding: 1rem 1.25rem;
  transition: background 0.3s ease;
}

.timer--warning {
  background: linear-gradient(135deg, #d97706, #b45309);
}

.timer--critical {
  background: linear-gradient(135deg, #dc2626, #991b1b);
  animation: pulse-critical 1s ease-in-out infinite;
}

@keyframes pulse-critical {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.85; }
}

.timer__top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.125rem;
}

.timer__icon {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
}

.timer__time {
  font-size: 1.75rem;
  font-weight: 800;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.timer__label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.timer__bar {
  height: 6px !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 9999px !important;
}

:deep(.timer__bar-fill) {
  background: #ffffff !important;
  border-radius: 9999px !important;
  transition: width 1s linear !important;
}
</style>