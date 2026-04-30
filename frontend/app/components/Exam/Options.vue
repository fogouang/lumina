<template>
  <div class="options" :class="{ 'options--single': isSingleCol }">
    <button
      v-for="opt in options"
      :key="opt.key"
      class="option"
      :class="{ 'option--selected': selected === opt.key }"
      :disabled="disabled"
      @click="emit('select', opt.key)"
    >
      <span class="option__key">{{ opt.key.toUpperCase() }}</span>
      <span class="option__text">{{ opt.text }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { QuestionResponse } from '#shared/api/models/QuestionResponse'

const props = defineProps<{
  question: QuestionResponse
  selected: string | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: [key: string]
}>()

const options = computed(() => [
  { key: 'a', text: props.question.option_a },
  { key: 'b', text: props.question.option_b },
  { key: 'c', text: props.question.option_c },
  { key: 'd', text: props.question.option_d },
])

// Une colonne si les textes sont longs
const isSingleCol = computed(() =>
  options.value.some(o => o.text && o.text.length > 40)
)
</script>

<style scoped>
.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
}

.options--single {
  grid-template-columns: 1fr;
}

.option {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  background: var(--bg-card);
  border: 1.5px solid var(--border-color);
  border-radius: 0.875rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;
}

.option:hover:not(:disabled) {
  border-color: var(--color-primary-400);
  background: var(--color-primary-50);
}

.option--selected {
  border-color: var(--color-primary-600) !important;
  background: var(--color-primary-50) !important;
}

.option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.option__key {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-ground);
  border: 1.5px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.option--selected .option__key {
  background: var(--gradient-primary);
  border-color: transparent;
  color: #ffffff;
}

.option__text {
  font-size: 0.9375rem;
  color: var(--text-primary);
  line-height: 1.4;
  text-align: left;
}

@media (max-width: 640px) {
  .options { grid-template-columns: 1fr; }
}
</style>