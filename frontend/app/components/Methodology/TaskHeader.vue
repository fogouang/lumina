<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    badge: string;
    badgeIcon?: string;
  }>(),
  {
    badgeIcon: "pi pi-clock",
  }
);
</script>

<template>
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h3 class="font-heading text-xl font-bold text-ink">{{ title }}</h3>
      <p class="mt-1 text-sm text-muted">{{ subtitle }}</p>
    </div>
    <span class="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1 text-xs font-bold text-accent-800 dark:bg-accent-950 dark:text-accent-300">
      <i :class="[badgeIcon, 'text-[0.65rem]']" />
      {{ badge }}
    </span>
  </div>
</template>