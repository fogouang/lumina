<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    words: string[];
    interval?: number;
  }>(),
  {
    interval: 2600,
  }
);

const index = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  timer = setInterval(() => {
    index.value = (index.value + 1) % props.words.length;
  }, props.interval);
});

onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

<template>
  <span class="inline-grid">
    <Transition name="word">
      <span :key="index" class="text-gradient col-start-1 row-start-1 pb-[0.12em]">
        {{ words[index] }}
      </span>
    </Transition>
  </span>
</template>

<style scoped>
.word-enter-active,
.word-leave-active {
  transition:
    opacity 0.5s var(--ease-spring),
    transform 0.6s var(--ease-spring),
    filter 0.5s var(--ease-spring);
}

.word-enter-from {
  opacity: 0;
  transform: translateY(0.45em);
  filter: blur(8px);
}

.word-leave-to {
  opacity: 0;
  transform: translateY(-0.45em);
  filter: blur(8px);
}
</style>