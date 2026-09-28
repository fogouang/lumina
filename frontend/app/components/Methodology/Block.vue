<script setup lang="ts">
defineProps<{
  title: string;
  icon: string;
}>();
</script>

<template>
  <section>
    <h3 class="mb-5 flex items-center gap-3 font-heading text-lg font-bold text-ink">
      <span class="grid size-8 shrink-0 place-items-center rounded-[0.8rem_0.25rem] bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
        <i :class="[icon, 'text-sm']" />
      </span>
      {{ title }}
    </h3>
    <slot />
  </section>
</template>