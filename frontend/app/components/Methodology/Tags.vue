<script setup lang="ts">
defineProps<{
  items: string[];
}>();
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <span
      v-for="item in items"
      :key="item"
      class="rounded-full border border-primary-100 bg-primary-50 px-3.5 py-1.5 text-sm font-medium text-primary-700 dark:border-primary-900 dark:bg-primary-950 dark:text-primary-300"
    >
      {{ item }}
    </span>
  </div>
</template>