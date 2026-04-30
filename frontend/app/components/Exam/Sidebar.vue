<template>
  <aside class="exam-sidebar">

    <!-- Timer -->
    <ExamTimer
      :total-seconds="totalSeconds"
      @expired="emit('expired')"
    />

    <!-- Navigation -->
    <div class="exam-sidebar__nav">
      <ExamQuestionNav
        :questions="questions"
        :current-index="currentIndex"
        :answered-ids="answeredIds"
        @go="emit('go', $event)"
      />
    </div>

    <!-- Quitter -->
    <button class="exam-sidebar__quit" @click="emit('quit')">
      <i class="pi pi-sign-out" />
      Quitter l'examen
    </button>

  </aside>
</template>

<script setup lang="ts">
import type { QuestionResponse } from '#shared/api/models/QuestionResponse'

defineProps<{
  questions:    QuestionResponse[]
  currentIndex: number
  answeredIds:  string[]
  totalSeconds: number
}>()

const emit = defineEmits<{
  go:      [index: number]
  quit:    []
  expired: []
}>()
</script>

<style scoped>
.exam-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 1rem;
  height: fit-content;
}

.exam-sidebar__nav {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.875rem;
  padding: 1.25rem;
}

.exam-sidebar__quit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: 1px solid var(--color-danger-200);
  border-radius: 0.75rem;
  color: var(--color-danger-600);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.exam-sidebar__quit:hover {
  background: var(--color-danger-50);
  border-color: var(--color-danger-400);
}

@media (max-width: 1024px) {
  .exam-sidebar {
    width: 100%;
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: stretch;
  }

  .exam-sidebar__nav {
    flex: 1;
    min-width: 200px;
  }

  .exam-sidebar__quit {
    width: auto;
    flex-shrink: 0;
  }
}
</style>