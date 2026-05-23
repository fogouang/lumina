<template>
  <div class="bg-(--bg-card) border border-(--border-color) rounded-2xl overflow-hidden">
    <div class="px-5 py-4 border-b border-(--border-color) flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
          {{ number }}
        </div>
        <div>
          <p class="text-sm font-bold text-(--text-primary)">{{ label }}</p>
          <p class="text-xs text-(--text-tertiary)">{{ wordMin }}–{{ wordMax }} mots recommandés</p>
        </div>
      </div>
      <Tag :value="`${wordMin}–${wordMax} mots`" severity="warning" />
    </div>

    <div class="px-5 py-4">
      <p class="text-xs text-(--text-tertiary) italic mb-3">{{ description }}</p>
      <div class="bg-(--bg-ground) rounded-xl p-4">
        <p class="text-sm text-(--text-primary) leading-relaxed">{{ instruction }}</p>
      </div>
    </div>

    <!-- Correction -->
    <div v-if="correction" class="border-t border-(--border-color)">
      <button
        class="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-(--bg-hover) transition-colors"
        @click="showCorrection = !showCorrection"
      >
        <span class="flex items-center gap-2 text-sm font-semibold text-primary-600">
          <i class="pi pi-eye text-xs" />
          Voir la proposition de correction
        </span>
        <i class="pi text-xs text-(--text-tertiary) transition-transform duration-200"
          :class="showCorrection ? 'pi-chevron-up' : 'pi-chevron-down'" />
      </button>
      <div v-if="showCorrection" class="px-5 pb-4">
        <p class="text-sm text-(--text-primary) leading-relaxed whitespace-pre-wrap bg-primary-50 border border-primary-100 rounded-xl p-4">
          {{ correction }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const showCorrection = ref(false)

defineProps<{
  number: string | number
  label: string
  typeLabel: string
  instruction: string
  wordMin: number
  wordMax: number
  description: string
  correction?: string
}>()
</script>