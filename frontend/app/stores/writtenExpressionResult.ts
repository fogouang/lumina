import { defineStore } from "pinia";

// Forme brute retournée par POST /ai-correct-combined — cf. get_combined_correction_prompt
export interface CombinedCorrectionResult {
  global_assessment: {
    overall_score: number;
    cecrl_level: string;
    appreciation: string;
  };
  criteria_scores: {
    structure_score: number;
    structure_feedback: string;
    cohesion_score: number;
    cohesion_feedback: string;
    vocabulary_score: number;
    vocabulary_feedback: string;
    grammar_score: number;
    grammar_feedback: string;
    task_score: number;
    task_feedback: string;
  };
  task_feedbacks: {
    task1: { corrected_text: string };
    task2: { corrected_text: string };
    task3: { corrected_text: string };
  };
  corrections: unknown[];
  suggestions: unknown[];
}

export const useWrittenExpressionResultStore = defineStore("writtenExpressionResult", () => {
  const result = ref<CombinedCorrectionResult | null>(null);

  function setResult(value: CombinedCorrectionResult): void {
    result.value = value;
  }

  function $reset(): void {
    result.value = null;
  }

  return { result, setResult, $reset };
});