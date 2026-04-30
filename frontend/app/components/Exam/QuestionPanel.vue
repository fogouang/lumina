<template>
  <div class="question-panel">

    <!-- Header -->
    <div class="question-panel__header">
      <span class="question-panel__badge">Question {{ question.question_number }}</span>
      <Tag :value="`${question.points} pts`" severity="success" />
    </div>

    <!-- Contenu -->
    <div class="question-panel__body">

      <!-- ORAL -->
      <template v-if="question.type === 'oral'">
        <div
          v-if="question.image_url"
          class="question-panel__image-wrap"
          @click="openZoom(mediaUrl(question.image_url) ?? '')"
        >
          <img
            :src="mediaUrl(question.image_url) ?? ''"
            class="question-panel__image"
            alt="Document"
          />
          <div class="question-panel__image-overlay">
            <i class="pi pi-search-plus" />
          </div>
        </div>
        <p v-if="question.asked_question" class="question-panel__asked">
          {{ question.asked_question }}
        </p>
        <ExamAudioPlayer
          v-if="question.audio_url"
          :src="mediaUrl(question.audio_url) ?? ''"
        />
      </template>

      <!-- ÉCRIT -->
      <template v-else>
        <div
          v-if="question.image_url"
          class="question-panel__image-wrap"
          @click="openZoom(mediaUrl(question.image_url) ?? '')"
        >
          <img
            :src="mediaUrl(question.image_url) ?? ''"
            class="question-panel__image"
            alt="Document"
          />
          <div class="question-panel__image-overlay">
            <i class="pi pi-search-plus" />
          </div>
        </div>
        <div v-else-if="question.question_text" class="question-panel__text-doc">
          {{ question.question_text }}
        </div>
        <p v-if="question.asked_question" class="question-panel__asked">
          {{ question.asked_question }}
        </p>
      </template>

    </div>

    <!-- Options -->
    <ExamOptions
      :question="question"
      :selected="selected"
      :disabled="submitting"
      @select="emit('select', $event)"
    />

    <!-- Footer navigation -->
    <div class="question-panel__footer">
      <Button
        label="Précédent"
        icon="pi pi-arrow-left"
        text
        :disabled="isFirst"
        @click="emit('prev')"
      />

      <span class="question-panel__progress">{{ currentIndex + 1 }} / {{ total }}</span>

      <Button
        v-if="!isLast"
        label="Suivant"
        icon="pi pi-arrow-right"
        icon-pos="right"
        class="question-panel__next bg-gradient-primary"
        :loading="submitting"
        :disabled="!selected"
        @click="emit('next')"
      />
      <Button
        v-else
        label="Terminer"
        icon="pi pi-check"
        icon-pos="right"
        severity="success"
        :loading="submitting"
        :disabled="!selected"
        @click="emit('finish')"
      />
    </div>

    <!-- Dialog zoom image -->
    <Dialog
      v-model:visible="zoomVisible"
      modal
      :closable="true"
      :style="{ width: '90vw', maxWidth: '900px', background: '#000' }"
      :pt="{ content: { style: 'padding:0;background:#000' }, header: { style: 'background:#000;border:none' } }"
    >
      <img :src="zoomSrc" style="width:100%;height:auto;display:block;" alt="Zoom" />
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import type { QuestionResponse } from '#shared/api/models/QuestionResponse'

defineProps<{
  question:     QuestionResponse
  selected:     string | null
  currentIndex: number
  total:        number
  isFirst:      boolean
  isLast:       boolean
  submitting:   boolean
}>()

const emit = defineEmits<{
  select: [key: string]
  prev:   []
  next:   []
  finish: []
}>()

const { mediaUrl } = useMedia()

// ── Zoom image ────────────────────────────────────────────────
const zoomVisible = ref(false)
const zoomSrc     = ref('')

function openZoom(src: string) {
  zoomSrc.value     = src
  zoomVisible.value = true
}
</script>

<style scoped>
.question-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.5rem;
}

/* Header */
.question-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.question-panel__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 1rem;
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border: 1px solid var(--color-primary-200);
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 700;
}

/* Body */
.question-panel__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Image zoomable */
.question-panel__image-wrap {
  position: relative;
  cursor: zoom-in;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.question-panel__image {
  width: 100%;
  max-height: 280px;
  object-fit: contain;
  display: block;
  transition: transform 0.2s ease;
}

.question-panel__image-wrap:hover .question-panel__image {
  transform: scale(1.02);
}

.question-panel__image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0);
  transition: background 0.2s ease;
}

.question-panel__image-wrap:hover .question-panel__image-overlay {
  background: rgba(0,0,0,0.25);
}

.question-panel__image-overlay i {
  font-size: 1.75rem;
  color: #ffffff;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.question-panel__image-wrap:hover .question-panel__image-overlay i {
  opacity: 1;
}

/* Texte doc */
.question-panel__text-doc {
  background: var(--bg-ground);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  font-size: 0.9375rem;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
  max-height: 240px;
  overflow-y: auto;
}

.question-panel__asked {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
}

/* Footer */
.question-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.875rem;
  border-top: 1px solid var(--border-color);
  gap: 0.5rem;
}

.question-panel__progress {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  font-weight: 500;
  white-space: nowrap;
}

.question-panel__next {
  border: none !important;
  border-radius: 0.75rem !important;
  font-weight: 700 !important;
}

@media (max-width: 640px) {
  .question-panel { padding: 1rem; gap: 1rem; }
  .question-panel__image { max-height: 200px; }
}
</style>