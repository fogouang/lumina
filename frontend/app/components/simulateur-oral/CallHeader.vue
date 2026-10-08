<script setup lang="ts">
defineProps<{
  title: string
  phase: string
}>()

const emit = defineEmits<{
  leave: []
}>()
</script>

<template>
  <div
    class="flex shrink-0 items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
  >
    <button
      type="button"
      aria-label="Quitter la simulation"
      class="grid size-9 shrink-0 place-items-center rounded-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      @click="emit('leave')"
    >
      <i class="pi pi-arrow-left text-sm" />
    </button>

    <div class="flex min-w-0 flex-1 items-center gap-2.5">
      <span
        class="size-2 shrink-0 rounded-full"
        :class="
          phase === 'live'
            ? 'animate-pulse bg-red-500 shadow-[0_0_0_4px_rgb(239_68_68/0.25)]'
            : 'bg-white/30'
        "
      />
      <h1 class="truncate font-heading text-sm font-bold text-white/90">
        {{ title }}
      </h1>
    </div>

    <span
      v-if="['intro', 'prep', 'live'].includes(phase)"
      class="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/70"
    >
      <i class="pi pi-shield text-[0.65rem]" />
      Mode Examen
    </span>
  </div>
</template>