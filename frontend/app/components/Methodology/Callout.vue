<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: "info" | "tip" | "gold";
    icon?: string;
  }>(),
  {
    variant: "info",
  }
);

const styles = {
  info: {
    box: "border-l-4 border-primary bg-primary-50 dark:bg-primary-950",
    icon: "pi pi-info-circle text-primary",
    text: "text-ink [&_strong]:font-bold",
  },
  tip: {
    box: "border-l-4 border-accent-400 bg-accent-50 dark:bg-accent-950",
    icon: "pi pi-sparkles text-accent-700 dark:text-accent-300",
    text: "text-accent-900 dark:text-accent-200 [&_strong]:font-bold",
  },
  gold: {
    box: "featured-panel text-white shadow-brand",
    icon: "pi pi-sparkles text-accent-400",
    text: "text-white/90 [&_strong]:font-bold [&_strong]:text-white",
  },
};

const current = computed(() => styles[props.variant]);
</script>

<template>
  <div class="flex items-start gap-3 rounded-2xl p-4 sm:p-5" :class="current.box">
    <i :class="[icon ?? current.icon, 'mt-0.5 shrink-0']" />
    <div class="text-sm leading-relaxed" :class="current.text">
      <slot />
    </div>
  </div>
</template>