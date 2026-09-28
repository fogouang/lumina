<template>
  <div class="flex items-center gap-4">
    <span
      class="brand-gradient grid size-12 shrink-0 place-items-center rounded-leaf font-heading text-lg font-extrabold text-white shadow-brand"
    >
      {{ number }}
    </span>

    <div class="min-w-0 flex-1">
      <h2 class="font-heading text-xl font-bold leading-tight text-ink">
        Tâche {{ number }} : {{ title }}
      </h2>
      <p class="mt-0.5 inline-flex items-center gap-1.5 text-sm text-muted">
        <i :class="['pi', icon, 'text-xs']" />
        {{ duration }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  number: string;
  title: string;
  duration: string;
  icon: string;
  color?: string; 
}>();
</script>