<template>
  <div class="exam-topbar">
    <!-- Timer -->
    <div class="exam-topbar__timer" :class="{ 'exam-topbar__timer--warning': isWarning, 'exam-topbar__timer--critical': isCritical }">
      <i class="pi pi-clock" />
      <span>{{ formattedTime }}</span>
    </div>

    <!-- Compteurs -->
    <div class="exam-topbar__counters">
      <span class="exam-topbar__counter">{{ currentIndex + 1 }}/{{ total }}</span>
      <span class="exam-topbar__separator">·</span>
      <span class="exam-topbar__counter exam-topbar__counter--answered">{{ answeredCount }}/{{ total }}</span>
    </div>

    <!-- Actions -->
    <div class="exam-topbar__actions">
      <!-- Grille navigation -->
      <button class="exam-topbar__btn" @click="emit('openNav')">
        <i class="pi pi-th-large" />
      </button>
      <!-- Quitter -->
      <button class="exam-topbar__btn exam-topbar__btn--danger" @click="emit('quit')">
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

<style scoped>
.exam-topbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.exam-topbar__timer {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  min-width: 80px;
}

.exam-topbar__timer i { font-size: 0.9rem; color: var(--color-primary-500); }

.exam-topbar__timer--warning { color: #d97706; }
.exam-topbar__timer--warning i { color: #d97706; }

.exam-topbar__timer--critical {
  color: var(--color-danger-600);
  animation: pulse 1s ease-in-out infinite;
}
.exam-topbar__timer--critical i { color: var(--color-danger-600); }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}

.exam-topbar__counters {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex: 1;
  justify-content: center;
}

.exam-topbar__counter {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.exam-topbar__counter--answered {
  color: var(--color-success-600);
}

.exam-topbar__separator {
  color: var(--border-color);
}

.exam-topbar__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.exam-topbar__btn {
  width: 36px;
  height: 36px;
  border-radius: 0.625rem;
  border: 1px solid var(--border-color);
  background: var(--bg-ground);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.exam-topbar__btn:hover { background: var(--bg-hover); }

.exam-topbar__btn--danger {
  border-color: var(--color-danger-200);
  color: var(--color-danger-600);
}

.exam-topbar__btn--danger:hover {
  background: var(--color-danger-50);
}
</style>