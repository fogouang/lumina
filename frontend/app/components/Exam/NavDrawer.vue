<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissable-mask
    :draggable="false"
    :style="{ width: '92vw', maxWidth: '30rem' }"
    :pt="{ mask: { class: 'backdrop-blur-sm' } }"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <span class="grid size-9 place-items-center rounded-leaf bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
          <i class="pi pi-th-large text-sm" />
        </span>
        <div>
          <h3 class="font-heading text-lg font-bold leading-tight text-ink">Navigation</h3>
          <p class="text-xs font-semibold tabular-nums text-muted">
            {{ answeredCount }} / {{ questions.length }} répondues
          </p>
        </div>
      </div>
    </template>

    <div class="mb-4 h-1.5 overflow-hidden rounded-full bg-line">
      <div
        class="h-full rounded-full bg-linear-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
        :style="{ width: `${progress}%` }"
      />
    </div>

    <div class="grid grid-cols-6 gap-2.5 sm:grid-cols-8">
      <ExamNavButton
        v-for="(q, index) in questions"
        :key="q.id"
        :label="q.question_number"
        :current="index === currentIndex"
        :answered="answeredIds.includes(q.id)"
        class="max-w-11 text-sm"
        @click="onGo(index)"
      />
    </div>

    <ExamNavLegend class="mt-5 border-t border-line pt-4" />
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

// Progression du module en cours (affichage)
const answeredCount = computed(
  () => props.questions.filter((q) => props.answeredIds.includes(q.id)).length,
)
const progress = computed(() =>
  props.questions.length ? (answeredCount.value / props.questions.length) * 100 : 0,
)

function onGo(index: number) {
  emit('go', index)
  visible.value = false
}
</script>