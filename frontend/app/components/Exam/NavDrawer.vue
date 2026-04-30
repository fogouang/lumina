<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Navigation des questions"
    :style="{ width: '92vw', maxWidth: '480px' }"
    :draggable="false"
  >
    <div class="nav-drawer">
      <div class="nav-drawer__grid">
        <button
          v-for="(q, index) in questions"
          :key="q.id"
          class="nav-drawer__btn"
          :class="{
            'nav-drawer__btn--current':  index === currentIndex,
            'nav-drawer__btn--answered': answeredIds.includes(q.id),
          }"
          @click="onGo(index)"
        >
          {{ q.question_number }}
        </button>
      </div>

      <div class="nav-drawer__legend">
        <span class="nav-drawer__legend-item">
          <span class="nav-drawer__dot nav-drawer__dot--current" /> Actuelle
        </span>
        <span class="nav-drawer__legend-item">
          <span class="nav-drawer__dot nav-drawer__dot--answered" /> Répondue
        </span>
        <span class="nav-drawer__legend-item">
          <span class="nav-drawer__dot nav-drawer__dot--none" /> Non rép.
        </span>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import type { QuestionResponse } from '#shared/api/models/QuestionResponse'

const props = defineProps<{
  modelValue:   boolean
  questions:    QuestionResponse[]
  currentIndex: number
  answeredIds:  string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  go: [index: number]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function onGo(index: number) {
  emit('go', index)
  visible.value = false
}
</script>

<style scoped>
.nav-drawer { display: flex; flex-direction: column; gap: 1rem; }

.nav-drawer__grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.375rem;
}

.nav-drawer__btn {
  aspect-ratio: 1;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--bg-ground);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-drawer__btn--current {
  background: var(--gradient-primary);
  border-color: transparent;
  color: #ffffff;
}

.nav-drawer__btn--answered {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #15803d;
}

.nav-drawer__btn--current.nav-drawer__btn--answered {
  background: var(--gradient-primary);
  border-color: transparent;
  color: #ffffff;
}

.nav-drawer__legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.nav-drawer__legend-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.nav-drawer__dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.nav-drawer__dot--current  { background: var(--color-primary-500); }
.nav-drawer__dot--answered { background: #22c55e; }
.nav-drawer__dot--none     { background: transparent; border: 1px solid var(--border-color); }
</style>