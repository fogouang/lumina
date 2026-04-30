<template>
  <div class="question-panel">
    <!-- Header -->
    <div class="question-panel__header">
      <span class="question-panel__badge"
        >Question {{ question.question_number }}</span
      >
      <Tag
        :value="`${question.points} pts`"
        severity="success"
        class="question-panel__pts"
      />
    </div>

    <!-- Contenu -->
    <div class="question-panel__body">
      <!-- ORAL -->
      <template v-if="question.type === 'oral'">
        <img
          v-if="question.image_url"
          :src="mediaUrl(question.image_url) ?? ''"
          class="question-panel__image"
          alt="Document"
        />
        <p v-if="question.asked_question" class="question-panel__asked">
          {{ question.asked_question }}
        </p>
        <ExamAudioPlayer
          v-if="question.audio_url"
          :src="mediaUrl(question.audio_url) ?? ''"
          class="question-panel__audio"
        />
      </template>

      <!-- ÉCRIT -->
      <template v-else>
        <img
          v-if="question.image_url"
          :src="mediaUrl(question.image_url) ?? ''"
          class="question-panel__image"
          alt="Document"
        />
        <div
          v-else-if="question.question_text"
          class="question-panel__text-doc"
        >
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
      class="question-panel__options"
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

      <div class="question-panel__footer-center">
        <span class="question-panel__progress">
          {{ currentIndex + 1 }} / {{ total }}
        </span>
      </div>

      <Button
        v-if="!isLast"
        label="Suivant"
        icon="pi pi-arrow-right"
        icon-pos="right"
        class="question-panel__next bg-gradient-primary"
        :loading="submitting"
        @click="emit('next')"
      />
      <Button
        v-else
        label="Terminer l'examen"
        icon="pi pi-check"
        icon-pos="right"
        severity="success"
        :loading="submitting"
        @click="emit('finish')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QuestionResponse } from "#shared/api/models/QuestionResponse";

defineProps<{
  question: QuestionResponse;
  selected: string | null;
  currentIndex: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  submitting: boolean;
}>();

const { mediaUrl } = useMedia();

const emit = defineEmits<{
  select: [key: string];
  prev: [];
  next: [];
  finish: [];
}>();
</script>

<style scoped>
.question-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 1.75rem;
  height: 100%;
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
  padding: 0.5rem 1.25rem;
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border: 1px solid var(--color-primary-200);
  border-radius: 9999px;
  font-size: 0.9375rem;
  font-weight: 700;
}

/* Body */
.question-panel__body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
}

.question-panel__image {
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
}

.question-panel__text-doc {
  background: var(--bg-ground);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.25rem 1.5rem;
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
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
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.question-panel__footer-center {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  font-weight: 500;
}

.question-panel__next {
  border: none !important;
  border-radius: 0.75rem !important;
  font-weight: 700 !important;
}

@media (max-width: 640px) {
  .question-panel {
    padding: 1.25rem;
    gap: 1rem;
  }
}
</style>
