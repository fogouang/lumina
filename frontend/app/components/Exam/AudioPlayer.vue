<template>
  <div class="rounded-2xl border border-line bg-card p-4 shadow-soft">
    <div class="flex items-center gap-4">
      <button
        type="button"
        :aria-label="isPlaying ? 'Mettre en pause' : 'Lancer l\'audio'"
        class="brand-gradient grid size-12 shrink-0 place-items-center rounded-full text-white shadow-brand transition-transform duration-200 ease-spring hover:scale-105 active:scale-95"
        @click="togglePlay"
      >
        <i :class="[isPlaying ? 'pi pi-pause' : 'pi pi-play translate-x-px', 'text-lg']" />
      </button>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 text-xs font-semibold text-muted">
          <i class="pi pi-headphones text-primary" />
          Extrait audio
          <span v-if="isPlaying" class="ml-auto inline-flex items-center gap-1.5 text-primary">
            <span class="size-1.5 animate-pulse rounded-full bg-primary" />
            Lecture en cours
          </span>
        </div>

        <div class="group mt-2 cursor-pointer py-2" @click="seek">
          <div class="relative h-1.5 rounded-full bg-card-2">
            <div class="brand-gradient absolute inset-y-0 left-0 rounded-full" :style="{ width: `${progress}%` }" />
            <div
              class="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-soft transition-transform duration-200 group-hover:scale-125"
              :style="{ left: `${progress}%` }"
            />
          </div>
        </div>

        <div class="flex justify-between font-mono text-xs tabular-nums text-faint">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>

    <audio
      ref="audioEl"
      :src="fullSrc"
      preload="auto"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onMetadata"
      @ended="isPlaying = false"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ src: string }>();
const { mediaUrl } = useMedia();
const fullSrc = computed(() => mediaUrl(props.src) ?? "");

const audioEl = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progress = computed(() =>
  duration.value ? (currentTime.value / duration.value) * 100 : 0,
);

async function togglePlay() {
  if (!audioEl.value) return;
  try {
    if (isPlaying.value) {
      audioEl.value.pause();
      isPlaying.value = false;
    } else {
      await audioEl.value.play();
      isPlaying.value = true;
    }
  } catch (e) {
    console.error("Play error:", e);
    isPlaying.value = false;
  }
}

function onError() {
  console.error("Audio error:", audioEl.value?.error);
  isPlaying.value = false;
}

function onTimeUpdate() {
  currentTime.value = audioEl.value?.currentTime ?? 0;
}

function onMetadata() {
  duration.value = audioEl.value?.duration ?? 0;
}

function seek(e: MouseEvent) {
  if (!audioEl.value) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  audioEl.value.currentTime = ratio * duration.value;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
}
onMounted(() => {
  console.log("audio src:", props.src);
  console.log("audio fullSrc:", fullSrc.value);
});
</script>
