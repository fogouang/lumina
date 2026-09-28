<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    subtitle?: string;
    align?: "center" | "left";
  }>(),
  {
    align: "center",
  }
);
</script>

<template>
  <div class="max-w-2xl" :class="align === 'center' ? 'mx-auto text-center' : ''">
    <span
      v-if="eyebrow"
      v-reveal
      class="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow-soft"
    >
      <span class="size-1.5 rounded-full bg-accent-400" />
      {{ eyebrow }}
    </span>
    <h2 v-reveal="{ delay: 80 }" class="mt-4 font-heading text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
      {{ title }}
    </h2>
    <p v-if="subtitle" v-reveal="{ delay: 160 }" class="mt-4 text-lg leading-relaxed text-muted">
      {{ subtitle }}
    </p>
  </div>
</template>