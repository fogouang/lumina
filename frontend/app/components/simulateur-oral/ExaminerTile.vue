<script setup lang="ts">
withDefaults(
  defineProps<{
    avatarUrl: string
    name?: string | null
    role?: string
    speaking?: boolean
    listening?: boolean
  }>(),
  {
    name: null,
    role: 'Examinatrice TCF Canada',
    speaking: false,
    listening: false,
  },
)

const avatarRef = ref<{
  getAudioOutput: () => { ctx: AudioContext; node: AudioNode } | null
} | null>(null)

defineExpose({
  getAudioOutput: () => avatarRef.value?.getAudioOutput() ?? null,
})
</script>

<template>
  <div
    class="relative h-full w-full overflow-hidden rounded-3xl border bg-linear-to-b from-primary-800 via-primary-900 to-primary-950 shadow-2xl shadow-black/40 transition-colors duration-300"
    :class="speaking ? 'border-accent-300/60' : 'border-white/10'"
  >
    <!-- Lumière douce derrière l'examinatrice -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(ellipse_at_50%_20%,rgb(255_255_255/0.12),transparent_70%)]"
    />

    <div class="absolute inset-0">
      <ClientOnly>
        <SimulateurOralExaminateurAvatar
          ref="avatarRef"
          :avatar-url="avatarUrl"
          :speaking="speaking"
          :listening="listening"
          camera-view="upper"
        >
          <template #fallback>
            <span class="grid size-24 place-items-center rounded-full bg-white/10">
              <i class="pi pi-user text-4xl text-white/70" />
            </span>
          </template>
        </SimulateurOralExaminateurAvatar>
      </ClientOnly>
    </div>

    <!-- Dégradé bas pour la lisibilité du badge -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/50 to-transparent"
    />

    <!-- Badge nom -->
    <div
      class="absolute bottom-3 left-3 flex items-center gap-2.5 rounded-xl bg-black/35 px-3 py-2 backdrop-blur-md"
    >
      <div class="flex h-4 items-end gap-0.5" aria-hidden="true">
        <span
          v-for="i in 4"
          :key="i"
          class="w-1 rounded-full bg-accent-300"
          :class="speaking ? 'voice-bar' : 'h-1 opacity-50'"
          :style="speaking ? { animationDelay: `${i * 0.12}s` } : undefined"
        />
      </div>
      <div class="leading-tight">
        <p class="text-sm font-semibold text-white">
          {{ name ?? 'Votre examinatrice' }}
        </p>
        <p class="text-[0.7rem] text-white/60">{{ role }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.voice-bar {
  animation: voice-bar 0.9s ease-in-out infinite;
}

@keyframes voice-bar {
  0%,
  100% {
    height: 25%;
  }
  50% {
    height: 100%;
  }
}
</style>