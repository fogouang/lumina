<template>
  <div>
    <p class="text-[11px] font-semibold uppercase tracking-wider text-faint">Navigation des questions</p>

    <div class="mt-3 grid grid-cols-6 gap-1.5">
      <ExamNavButton
        v-for="(q, index) in questions"
        :key="q.id"
        :label="q.question_number"
        :current="index === currentIndex"
        :answered="answeredIds.includes(q.id)"
        @click="emit('go', index)"
      />
    </div>

    <ExamNavLegend class="mt-4 border-t border-line pt-3" />
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