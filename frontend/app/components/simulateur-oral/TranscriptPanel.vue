<script setup lang="ts">
const props = defineProps<{
  lines: { speaker: string; text: string }[]
}>()

const scroller = ref<HTMLDivElement | null>(null)

// Défile automatiquement vers le dernier message
watch(
  () => props.lines.map((l) => l.text.length).join(','),
  async () => {
    await nextTick()
    scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: 'smooth' })
  },
)
</script>

<template>
  <div
    class="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur"
  >
    <div class="flex items-center gap-2 border-b border-white/10 px-4 py-3">
      <i class="pi pi-align-left text-xs text-white/60" />
      <p class="text-xs font-bold uppercase tracking-wider text-white/60">
        Transcription
      </p>
    </div>

    <div ref="scroller" class="flex-1 space-y-3 overflow-y-auto p-4">
      <p v-if="!lines.length" class="pt-6 text-center text-xs text-white/40">
        La transcription apparaîtra ici.
      </p>

      <div
        v-for="(line, i) in lines"
        :key="i"
        class="flex"
        :class="line.speaker === 'candidat' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed"
          :class="
            line.speaker === 'candidat'
              ? 'rounded-br-sm bg-white text-primary-950 shadow-md shadow-black/25'
              : 'rounded-bl-sm border border-white/10 bg-white/10 text-white/85'
          "
        >
          {{ line.text }}
        </div>
      </div>
    </div>
  </div>
</template>