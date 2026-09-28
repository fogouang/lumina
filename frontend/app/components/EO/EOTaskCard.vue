<template>
  <div
    class="overflow-hidden rounded-card border bg-card shadow-soft transition-all duration-300 ease-spring"
    :class="showCorrection ? 'border-primary-200 shadow-lift dark:border-primary-800' : 'border-line hover:shadow-lift'"
  >
    <!-- En-tête -->
    <div class="flex items-start justify-between gap-3 px-5 py-4">
      <div class="flex min-w-0 flex-1 items-start gap-3">
        <span class="grid size-8 shrink-0 place-items-center rounded-[0.8rem_0.25rem] bg-primary-50 font-heading text-xs font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
          {{ index }}
        </span>
        <p class="pt-1 font-medium leading-relaxed text-ink">
          {{ task.subject }}
        </p>
      </div>

      <button
        type="button"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200"
        :class="
          showCorrection
            ? 'border-transparent bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
            : 'border-line text-primary hover:border-primary-200 hover:bg-primary-50 dark:hover:bg-primary-950'
        "
        :aria-expanded="showCorrection"
        @click="showCorrection = !showCorrection"
      >
        <i :class="['pi text-xs', showCorrection ? 'pi-eye-slash' : 'pi-eye']" />
        {{ showCorrection ? "Masquer" : "Correction" }}
      </button>
    </div>

    <!-- Pistes de réponse -->
    <Transition name="slide-down">
      <div v-if="showCorrection" class="border-t border-line bg-canvas px-5 py-4">
        <p class="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint">
          <i class="pi pi-check-circle text-green-600 dark:text-green-400" />
          Pistes de réponse
        </p>
        <p
          class="whitespace-pre-line rounded-2xl border-l-4 border-green-400 bg-green-50 p-4 leading-relaxed text-ink dark:border-green-700 dark:bg-green-950"
        >
          {{ correctionText }}
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { EOTask2Response } from "#shared/api/models/EOTask2Response";
import type { EOTask3Response } from "#shared/api/models/EOTask3Response";

const props = defineProps<{
  index: number;
  task: EOTask2Response | EOTask3Response;
  taskType: "task2" | "task3";
  correctionField: "eo_task2_correction" | "eo_task3_correction";
}>();

const showCorrection = ref(false);

const correctionText = computed(() => {
  return (
    (props.task as unknown as Record<string, string>)[props.correctionField] ??
    ""
  );
});
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition:
    max-height 0.35s var(--ease-spring),
    opacity 0.25s ease;
  overflow: hidden;
  max-height: 600px;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>