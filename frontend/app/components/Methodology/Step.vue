<script setup lang="ts">
withDefaults(
  defineProps<{
    num: string | number;
    title: string;
    desc: string;
    tip?: string | null;
    examples?: string[] | null;
    exampleStyle?: "quote" | "bullet";
  }>(),
  {
    exampleStyle: "quote",
  }
);
</script>

<template>
  <div class="flex gap-4">
    <span class="brand-gradient grid size-9 shrink-0 place-items-center rounded-leaf font-heading text-sm font-extrabold text-white shadow-brand">
      {{ num }}
    </span>
    <div class="min-w-0 flex-1 pt-1">
      <p class="font-heading font-bold text-ink">{{ title }}</p>
      <p class="mt-1 text-sm leading-relaxed text-muted">{{ desc }}</p>

      <ul v-if="examples?.length" class="mt-3 flex flex-col gap-1.5 rounded-xl bg-canvas p-3.5">
        <li
          v-for="ex in examples"
          :key="ex"
          class="flex items-start gap-2 text-sm leading-relaxed"
          :class="exampleStyle === 'quote' ? 'italic text-primary-700 dark:text-primary-300' : 'text-ink'"
        >
          <template v-if="exampleStyle === 'quote'">« {{ ex }} »</template>
          <template v-else>
            <i class="pi pi-angle-right mt-1 text-[0.65rem] text-primary" />
            <span>{{ ex }}</span>
          </template>
        </li>
      </ul>

      <div
        v-if="tip"
        class="mt-3 flex items-start gap-2.5 rounded-xl border border-accent-200 bg-accent-50 p-3.5 dark:border-accent-900 dark:bg-accent-950"
      >
        <i class="pi pi-lightbulb mt-0.5 text-accent-700 dark:text-accent-300" />
        <p class="text-sm leading-relaxed text-accent-900 dark:text-accent-200">{{ tip }}</p>
      </div>
    </div>
  </div>
</template>