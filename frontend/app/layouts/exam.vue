<!-- layouts/exam.vue -->
<template>
  <div class="exam-wrapper">
    <slot />
  </div>
</template>

<style>
.exam-wrapper {
  min-height: 100vh;
  background: var(--bg-ground);
}
</style>