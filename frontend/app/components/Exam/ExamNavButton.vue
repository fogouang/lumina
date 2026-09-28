<template>
  <button
    type="button"
    :disabled="locked"
    :aria-current="current ? 'step' : undefined"
    :aria-label="`Question ${label}${answered ? ', répondue' : ''}`"
    class="relative mx-auto grid aspect-square w-full max-w-10 place-items-center rounded-full border font-heading text-xs font-bold tabular-nums transition-all duration-200 ease-spring disabled:cursor-not-allowed"
    :class="[stateClass, locked ? '' : 'hover:-translate-y-0.5 active:translate-y-px']"
  >
    <!-- Reflet (effet bombé) -->
    <span
      v-if="!flat"
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-1.5 top-0.5 h-1/2 rounded-full bg-linear-to-b to-white/0"
      :class="current || answered ? 'from-white/40' : 'from-white/70 dark:from-white/10'"
    />
    <span class="relative">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  label:     number | string
  current?:  boolean
  answered?: boolean
  locked?:   boolean
}>()

// Verrouillée et sans réponse : pastille plate (pas de relief)
const flat = computed(() => props.locked && !props.current && !props.answered)

const stateClass = computed(() => {
  if (props.current) {
    return [
      'border-primary-800 bg-linear-to-b from-primary-500 to-primary-800 text-white',
      'shadow-[inset_0_-3px_0_rgb(0_0_0/0.25),0_4px_10px_-2px_rgb(32_80_155/0.55)]',
      'ring-2 ring-primary-300 ring-offset-2 ring-offset-card scale-105',
    ]
  }
  if (props.answered) {
    return [
      'border-emerald-700 bg-linear-to-b from-emerald-400 to-emerald-600 text-white',
      'shadow-[inset_0_-3px_0_rgb(0_0_0/0.2),0_3px_8px_-2px_rgb(5_150_105/0.5)]',
    ]
  }
  if (flat.value) {
    return 'border-line bg-card-2 text-faint'
  }
  return [
    'border-line bg-linear-to-b from-card to-card-2 text-muted hover:text-primary',
    'shadow-[inset_0_-3px_0_rgb(15_23_42/0.08),0_2px_5px_-1px_rgb(15_23_42/0.12)]',
    'dark:shadow-[inset_0_-3px_0_rgb(0_0_0/0.35),0_2px_5px_-1px_rgb(0_0_0/0.5)]',
  ]
})
</script>