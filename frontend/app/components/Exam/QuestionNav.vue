<template>
  <div class="question-nav">
    <p class="question-nav__title">Navigation des questions</p>

    <div class="question-nav__grid">
      <button
        v-for="(q, index) in questions"
        :key="q.id"
        class="question-nav__btn"
        :class="{
          'question-nav__btn--current':  index === currentIndex,
          'question-nav__btn--answered': answeredIds.includes(q.id),
        }"
        @click="emit('go', index)"
      >
        {{ q.question_number }}
      </button>
    </div>

    <!-- Légende -->
    <div class="question-nav__legend">
      <div class="question-nav__legend-item">
        <span class="question-nav__dot question-nav__dot--current" />
        <span>Actuelle</span>
      </div>
      <div class="question-nav__legend-item">
        <span class="question-nav__dot question-nav__dot--answered" />
        <span>Répondue</span>
      </div>
      <div class="question-nav__legend-item">
        <span class="question-nav__dot question-nav__dot--none" />
        <span>Non rép.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QuestionResponse } from '#shared/api/models/QuestionResponse'

defineProps<{
  questions:    QuestionResponse[]
  currentIndex: number
  answeredIds:  string[]
}>()

const emit = defineEmits<{
  go: [index: number]
}>()
</script>

<style scoped>
.question-nav__title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.875rem;
}

.question-nav__grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.question-nav__btn {
  width: 100%;
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

.question-nav__btn:hover {
  border-color: var(--color-primary-400);
  color: var(--color-primary-600);
}

.question-nav__btn--current {
  background: var(--gradient-primary);
  border-color: transparent;
  color: #ffffff;
}

.question-nav__btn--answered {
  background: var(--color-success-50);
  border-color: var(--color-success-500);
  color: var(--color-success-700);
}

.question-nav__btn--current.question-nav__btn--answered {
  background: var(--gradient-primary);
  border-color: transparent;
  color: #ffffff;
}

/* Légende */
.question-nav__legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.question-nav__legend-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.question-nav__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.question-nav__dot--current  { background: var(--color-primary-500); }
.question-nav__dot--answered { background: var(--color-success-500); border: 1px solid var(--color-success-500); }
.question-nav__dot--none     { background: transparent; border: 1px solid var(--border-color); }
</style>