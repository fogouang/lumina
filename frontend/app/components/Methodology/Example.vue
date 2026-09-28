<script setup lang="ts">
defineProps<{
  subject: string;
  wordCount?: number;
}>();
</script>

<template>
  <div class="overflow-hidden rounded-card border border-line bg-card shadow-soft">
    <div class="flex items-start gap-3 border-b border-line bg-canvas px-5 py-4">
      <i class="pi pi-bookmark mt-0.5 shrink-0 text-primary" />
      <p class="text-sm leading-relaxed text-muted">
        <strong class="font-semibold text-ink">Sujet :</strong> {{ subject }}
      </p>
    </div>
    <div class="flex flex-col gap-3 px-5 py-5 text-[0.9375rem] leading-relaxed text-ink">
      <slot />
    </div>
    <div
      v-if="wordCount"
      class="flex items-center gap-2 border-t border-green-200 bg-green-50 px-5 py-3 text-sm font-semibold text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
    >
      <i class="pi pi-check-circle" />
      {{ wordCount }} mots
    </div>
  </div>
</template>