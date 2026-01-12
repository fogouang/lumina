// Durées en secondes
export const EXAM_DURATIONS = {
  COMPREHENSION_ORAL: 35 * 60,      // 35 minutes
  COMPREHENSION_WRITTEN: 60 * 60,   // 60 minutes
  EXPRESSION_WRITTEN: 60 * 60,      // 60 minutes (total pour 3 tâches)
  EXPRESSION_ORAL: 30 * 60,         // 30 minutes (total pour 3 tâches)
} as const;

// Nombre de questions
export const QUESTION_COUNTS = {
  ORAL: 39,
  WRITTEN: 39,
  TOTAL: 78,
} as const;

// Nombre de tâches expression
export const EXPRESSION_TASK_COUNTS = {
  WRITTEN: 3,
  ORAL: 3,
} as const;

// Séries gratuites
export const FREE_SERIES_NUMBERS = [1, 2, 3] as const;