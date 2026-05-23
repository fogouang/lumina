<template>
  <div class="flex items-center gap-4">
    <!-- Numéro badge -->
    <div
      :class="`bg-linear-to-br ${color} w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md`"
    >
      <span class="text-white font-extrabold text-lg leading-none">{{
        number
      }}</span>
    </div>

    <!-- Title + meta -->
    <div class="flex-1 min-w-0">
      <h2 class="text-lg font-bold text-(--text-primary) leading-tight">
        Tâche {{ number }} — {{ title }}
      </h2>
      <p class="text-(--text-secondary) text-sm flex items-center gap-1 mt-0.5">
        <i :class="`pi ${icon} text-xs`" />
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
  color: string;
}>();
</script>