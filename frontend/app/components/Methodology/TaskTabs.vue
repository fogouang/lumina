<script setup lang="ts">
defineProps<{
  tasks: { id: number; label: string }[];
}>();

const model = defineModel<number>({ required: true });
</script>

<template>
  <div role="tablist" class="flex gap-1 overflow-x-auto rounded-2xl bg-card-2 p-1">
    <button
      v-for="t in tasks"
      :key="t.id"
      type="button"
      role="tab"
      :aria-selected="model === t.id"
      class="flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-spring"
      :class="model === t.id ? 'bg-card text-primary shadow-soft' : 'text-muted hover:text-ink'"
      @click="model = t.id"
    >
      {{ t.label }}
    </button>
  </div>
</template>