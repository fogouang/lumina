<template>
  <div
    class="sticky bottom-0 z-20 flex items-center justify-between gap-3 border-t border-line bg-card/90 px-4 pt-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]"
  >
    <AppButton
      icon="pi pi-arrow-left"
      variant="ghost"
      rounded
      aria-label="Question précédente"
      :disabled="isFirst"
      @click="emit('prev')"
    />

    <div class="flex items-center gap-2">
      <span
        v-if="level"
        class="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300"
      >
        {{ level }}
      </span>
      <span class="font-heading text-sm font-bold text-ink">{{ pts }} pts</span>
    </div>

    <AppButton
      :icon="isLast ? 'pi pi-check' : 'pi pi-arrow-right'"
      :variant="selected ? 'gradient' : 'secondary'"
      rounded
      :aria-label="isLast ? 'Terminer' : 'Question suivante'"
      :disabled="!selected"
      @click="isLast ? emit('finish') : emit('next')"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isFirst:  boolean
  isLast:   boolean
  selected: string | null
  level:    string | null
  pts:      number
}>()

const emit = defineEmits<{
  prev:   []
  next:   []
  finish: []
}>()
</script>
