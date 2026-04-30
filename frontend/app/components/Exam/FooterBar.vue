<template>
  <div class="exam-footer">
    <Button
      icon="pi pi-arrow-left"
      text
      rounded
      :disabled="isFirst"
      class="exam-footer__btn"
      @click="emit('prev')"
    />

    <div class="exam-footer__center">
      <Tag v-if="level" :value="level" severity="success" />
      <span class="exam-footer__pts">{{ pts }} pts</span>
    </div>

    <Button
      icon="pi pi-arrow-right"
      rounded
      :disabled="!selected"
      class="exam-footer__btn exam-footer__btn--next"
      :class="{ 'bg-gradient-primary': selected }"
      @click="isLast ? emit('finish') : emit('next')"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isFirst:  boolean
  isLast:   boolean
  selected: string | null
  level:    string | null
  pts:      number
}>()

const emit = defineEmits<{
  prev:   []
  next:   []
  finish: []
}>()
</script>

<style scoped>
.exam-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.exam-footer__center {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.exam-footer__pts {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.exam-footer__btn {
  width: 44px !important;
  height: 44px !important;
}

.exam-footer__btn--next {
  border: none !important;
}
</style>