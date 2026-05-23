<template>
  <div
    class="bg-(--bg-card) border border-(--border-color) rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md"
  >
    <!-- Card header -->
    <div class="px-5 py-4 flex items-start justify-between gap-3">
      <div class="flex items-start gap-3 flex-1 min-w-0">
        <!-- Index badge -->
        <span
          class="shrink-0 w-7 h-7 rounded-full bg-(--bg-ground) border border-(--border-color) text-(--text-secondary) text-xs font-bold flex items-center justify-center mt-0.5"
        >
          {{ index }}
        </span>

        <!-- Subject -->
        <p class="text-(--text-primary) leading-relaxed font-medium">
          {{ task.subject }}
        </p>
      </div>

      <!-- Toggle correction -->
      <button
        type="button"
        class="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30"
        @click="showCorrection = !showCorrection"
      >
        <i
          :class="[
            'pi text-xs transition-transform duration-200',
            showCorrection ? 'pi-eye-slash' : 'pi-eye',
          ]"
        />
        {{ showCorrection ? "Masquer" : "Correction" }}
      </button>
    </div>

    <!-- Correction panel -->
    <Transition name="slide-down">
      <div
        v-if="showCorrection"
        class="border-t border-(--border-color) px-5 py-4 bg-(--bg-ground)"
      >
        <p
          class="text-xs font-semibold text-(--text-tertiary) uppercase tracking-wide mb-3 flex items-center gap-1.5"
        >
          <i class="pi pi-check-circle text-green-500" />
          Pistes de réponse
        </p>
        <p
          class="text-green-800  text-md leading-relaxed whitespace-pre-line"
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
    max-height 0.25s ease,
    opacity 0.2s ease;
  overflow: hidden;
  max-height: 500px;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
