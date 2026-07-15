<script setup lang="ts">
interface CriterionDisplay {
  name: string;
  score: number;
  max: number;
  feedback: string;
}

interface TaskFeedback {
  taskNumber: number;
  correctedText: string;
}

const props = defineProps<{
  overallScore: number; // /20
  cecrlLevel: string;
  appreciation: string;
  criteria: CriterionDisplay[];
  tasks: TaskFeedback[];
  corrections: unknown[];
  suggestions: unknown[];
}>();

function itemText(item: unknown, keys: string[]): string | null {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    for (const k of keys) {
      const v = (item as Record<string, unknown>)[k];
      if (typeof v === "string" && v) return v;
    }
  }
  return null;
}

function correctionOriginal(item: unknown): string | null {
  return itemText(item, ["original", "text", "avant"]);
}
function correctionFixed(item: unknown): string | null {
  return itemText(item, ["corrected", "correction", "suggestion", "apres"]);
}
function correctionExplanation(item: unknown): string | null {
  return itemText(item, ["explanation", "explication", "comment"]);
}
function suggestionText(item: unknown): string {
  return itemText(item, ["text", "suggestion", "message"]) ?? String(item);
}
</script>

<template>
  <div class="written-result">
    <Card>
      <template #content>
        <div class="written-result__hero">
          <div>
            <p class="written-result__hero-label">Score global</p>
            <p class="written-result__hero-score">{{ overallScore }}/20</p>
          </div>
          <Tag severity="info" :value="cecrlLevel" />
        </div>
        <p class="written-result__appreciation">{{ appreciation }}</p>
      </template>
    </Card>

    <Card>
      <template #title>Détail par critère</template>
      <template #content>
        <div class="written-result__criteria">
          <div v-for="c in criteria" :key="c.name" class="written-result__criterion">
            <div class="written-result__criterion-header">
              <span>{{ c.name }}</span>
              <Tag :value="`${c.score}/${c.max}`" />
            </div>
            <ProgressBar :value="(c.score / c.max) * 100" :show-value="false" />
            <p v-if="c.feedback" class="written-result__criterion-feedback">{{ c.feedback }}</p>
          </div>
        </div>
      </template>
    </Card>

    <Card v-if="corrections.length">
      <template #title>Corrections</template>
      <template #content>
        <ul class="written-result__list">
          <li v-for="(c, i) in corrections" :key="i">
            <template v-if="correctionOriginal(c) || correctionFixed(c)">
              <s v-if="correctionOriginal(c)">{{ correctionOriginal(c) }}</s>
              <span v-if="correctionOriginal(c) && correctionFixed(c)"> → </span>
              <strong v-if="correctionFixed(c)">{{ correctionFixed(c) }}</strong>
              <p v-if="correctionExplanation(c)" class="written-result__list-note">
                {{ correctionExplanation(c) }}
              </p>
            </template>
            <template v-else>{{ suggestionText(c) }}</template>
          </li>
        </ul>
      </template>
    </Card>

    <Card v-if="suggestions.length">
      <template #title>Suggestions</template>
      <template #content>
        <ul class="written-result__list">
          <li v-for="(s, i) in suggestions" :key="i">{{ suggestionText(s) }}</li>
        </ul>
      </template>
    </Card>

    <Card v-for="task in tasks" :key="task.taskNumber">
      <template #title>Tâche {{ task.taskNumber }} - texte corrigé</template>
      <template #content>
        <p class="written-result__corrected-text">{{ task.correctedText }}</p>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.written-result {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 720px;
  margin: 0 auto;
}
.written-result__hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.written-result__hero-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
  margin: 0;
}
.written-result__hero-score {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
}
.written-result__appreciation {
  margin-top: 0.75rem;
  color: var(--text-secondary);
}
.written-result__criteria {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.written-result__criterion-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.375rem;
  font-size: 0.9rem;
  font-weight: 600;
}
.written-result__criterion-feedback {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}
.written-result__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-left: 1rem;
}
.written-result__list-note {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0.25rem 0 0;
}
.written-result__corrected-text {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>