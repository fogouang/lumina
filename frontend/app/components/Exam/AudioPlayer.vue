<template>
  <div class="audio-player">
    <div class="audio-player__inner">
      <button class="audio-player__play-btn" @click="togglePlay">
        <i :class="isPlaying ? 'pi pi-pause' : 'pi pi-play'" />
      </button>

      <div class="audio-player__info">
        <div class="audio-player__label">
          <i class="pi pi-headphones" />
          <span>Extrait audio</span>
        </div>
        <div class="audio-player__progress" @click="seek">
          <div class="audio-player__track">
            <div
              class="audio-player__fill"
              :style="{ width: `${progress}%` }"
            />
            <div
              class="audio-player__thumb"
              :style="{ left: `${progress}%` }"
            />
          </div>
        </div>
        <div class="audio-player__times">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>

    <audio
      ref="audioEl"
      :src="fullSrc"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onMetadata"
      @ended="isPlaying = false"
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

function togglePlay() {
  if (!audioEl.value) return;
  if (isPlaying.value) {
    audioEl.value.pause();
  } else {
    audioEl.value.play();
  }
  isPlaying.value = !isPlaying.value;
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

<style scoped>
.audio-player {
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  border-radius: 0.875rem;
  padding: 1rem 1.25rem;
}

.audio-player__inner {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.audio-player__play-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--gradient-primary);
  border: none;
  color: #ffffff;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.audio-player__play-btn:hover {
  transform: scale(1.05);
}

.audio-player__info {
  flex: 1;
  min-width: 0;
}

.audio-player__label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-primary-700);
  margin-bottom: 0.5rem;
}

.audio-player__progress {
  cursor: pointer;
  padding: 6px 0;
}

.audio-player__track {
  position: relative;
  height: 4px;
  background: rgba(0, 0, 0, 0.12);
  border-radius: 9999px;
}

.audio-player__fill {
  position: absolute;
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 9999px;
  transition: width 0.1s linear;
}

.audio-player__thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary-600);
  transition: left 0.1s linear;
}

.audio-player__times {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
}
</style>
