<template>
  <div class="overflow-hidden rounded-card border border-line bg-card shadow-soft">
    <!-- En-tête -->
    <div class="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <span class="brand-gradient grid size-10 shrink-0 place-items-center rounded-leaf font-heading text-sm font-bold text-white shadow-brand">
          {{ number }}
        </span>
        <div>
          <p v-if="typeLabel" class="text-[0.65rem] font-semibold uppercase tracking-wider text-faint">
            {{ typeLabel }}
          </p>
          <p class="font-heading text-sm font-bold text-ink">{{ label }}</p>
        </div>
      </div>
      <span class="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-800 dark:bg-accent-950 dark:text-accent-300">
        <i class="pi pi-align-left text-[0.65rem]" />
        {{ wordMin }} à {{ wordMax }} mots
      </span>
    </div>

    <!-- Consigne -->
    <div class="px-5 py-4">
      <p class="mb-3 text-xs italic text-faint">{{ description }}</p>
      <div class="rounded-2xl border-l-4 border-primary bg-canvas p-4">
        <p class="text-sm leading-relaxed text-ink">{{ instruction }}</p>
      </div>
    </div>

    <!-- Correction -->
    <div v-if="correction" class="border-t border-line">
      <button
        type="button"
        class="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-card-2"
        :aria-expanded="showCorrection"
        @click="showCorrection = !showCorrection"
      >
        <span class="flex items-center gap-2 text-sm font-semibold text-primary">
          <i class="pi pi-eye text-xs" />
          {{ showCorrection ? "Masquer" : "Voir" }} la proposition de correction
        </span>
        <i
          class="pi pi-chevron-down text-xs text-faint transition-transform duration-300 ease-spring"
          :class="showCorrection ? 'rotate-180' : ''"
        />
      </button>

      <Transition
        enter-active-class="transition-all duration-300 ease-spring"
        leave-active-class="transition-all duration-200"
        enter-from-class="opacity-0 -translate-y-1"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-if="showCorrection" class="px-5 pb-5">
          <p class="whitespace-pre-wrap rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-relaxed text-ink dark:border-green-900 dark:bg-green-950">
            {{ correction }}
          </p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const showCorrection = ref(false);

defineProps<{
  number: string | number;
  label: string;
  typeLabel: string;
  instruction: string;
  wordMin: number;
  wordMax: number;
  description: string;
  correction?: string;
}>();
</script>