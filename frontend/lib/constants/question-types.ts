export const QUESTION_TYPES = {
  ORAL: 'oral',
  WRITTEN: 'written',
} as const;

export type QuestionType = (typeof QUESTION_TYPES)[keyof typeof QUESTION_TYPES];

export const ANSWER_OPTIONS = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
} as const;

export type AnswerOption = (typeof ANSWER_OPTIONS)[keyof typeof ANSWER_OPTIONS];