<template>
  <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:gap-2.5">
    <button
      v-for="opt in options"
      :key="opt.key"
      type="button"
      :disabled="disabled"
      :aria-pressed="selected === opt.key"
      class="group flex items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left transition-all duration-200 ease-spring disabled:cursor-not-allowed disabled:opacity-60"
      :class="
        selected === opt.key
          ? 'border-primary bg-primary-50 shadow-soft dark:bg-primary-950'
          : 'border-line bg-card hover:border-primary-200 hover:shadow-soft'
      "
      @click="emit('select', opt.key)"
    >
      <span
        class="grid size-8 shrink-0 place-items-center rounded-[0.8rem_0.25rem] font-heading text-sm font-extrabold transition-all duration-200"
        :class="
          selected === opt.key
            ? 'brand-gradient text-white shadow-brand'
            : 'bg-card-2 text-muted group-hover:text-primary'
        "
      >
        {{ opt.key.toUpperCase() }}
      </span>
      <span
        class="flex-1 text-base leading-snug text-ink lg:text-[1.0625rem]"
        :class="selected === opt.key ? 'font-semibold' : ''"
      >
        {{ opt.text }}
      </span>
      <i
        v-if="selected === opt.key"
        class="pi pi-check-circle shrink-0 text-primary"
      />
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