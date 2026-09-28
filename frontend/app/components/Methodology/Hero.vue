<script setup lang="ts">
defineProps<{
  title: string;
  lead: string;
  stats: { icon: string; value: string; label: string }[];
}>();
</script>

<template>
  <div>
    <h2 class="font-heading text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{{ title }}</h2>
    <p class="mt-3 max-w-3xl leading-relaxed text-muted">{{ lead }}</p>

    <div class="mt-6 grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="flex items-center gap-3 rounded-2xl border border-line bg-canvas p-4"
      >
        <span class="grid size-10 shrink-0 place-items-center rounded-leaf bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
          <i :class="stat.icon" />
        </span>
        <div class="min-w-0">
          <p class="font-heading font-extrabold leading-tight text-ink">{{ stat.value }}</p>
          <p class="text-xs text-faint">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>