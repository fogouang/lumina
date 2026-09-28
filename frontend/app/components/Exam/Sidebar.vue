<template>
  <aside
    class="flex h-full flex-col gap-3 rounded-card border border-line bg-card p-3 shadow-soft"
  >
    <ExamTimer :total-seconds="totalSeconds" @expired="emit('expired')" />

    <div
      class="flex-1 overflow-y-auto rounded-2xl border border-line/60 bg-linear-to-b from-card-2 to-canvas p-4"
    >
      <ExamQuestionNav
        :questions="questions"
        :current-index="currentIndex"
        :answered-ids="answeredIds"
        @go="emit('go', $event)"
      />
    </div>

    <button
      type="button"
      class="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/60 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950"
      @click="emit('quit')"
    >
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