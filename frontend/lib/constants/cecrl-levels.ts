export const CECRL_LEVELS = {
  A1_MINUS: '< A1',
  A1: 'A1',
  A2: 'A2',
  A2_PLUS: 'A2+',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
  C2: 'C2',
} as const;

export type CECRLLevel = (typeof CECRL_LEVELS)[keyof typeof CECRL_LEVELS];

// Scores sur 699 (compréhension)
export const CECRL_SCORE_RANGES_COMPREHENSION = {
  [CECRL_LEVELS.A1_MINUS]: { min: 0, max: 99 },
  [CECRL_LEVELS.A1]: { min: 100, max: 199 },
  [CECRL_LEVELS.A2]: { min: 200, max: 259 },
  [CECRL_LEVELS.A2_PLUS]: { min: 260, max: 299 },
  [CECRL_LEVELS.B1]: { min: 300, max: 399 },
  [CECRL_LEVELS.B2]: { min: 400, max: 499 },
  [CECRL_LEVELS.C1]: { min: 500, max: 599 },
  [CECRL_LEVELS.C2]: { min: 600, max: 699 },
} as const;

// Scores sur 20 (expression)
export const CECRL_SCORE_RANGES_EXPRESSION = {
  [CECRL_LEVELS.A1_MINUS]: { min: 0, max: 0 },
  [CECRL_LEVELS.A1]: { min: 1, max: 1 },
  [CECRL_LEVELS.A2]: { min: 2, max: 3 },
  [CECRL_LEVELS.A2_PLUS]: { min: 4, max: 5 },
  [CECRL_LEVELS.B1]: { min: 6, max: 9 },
  [CECRL_LEVELS.B2]: { min: 10, max: 13 },
  [CECRL_LEVELS.C1]: { min: 14, max: 17 },
  [CECRL_LEVELS.C2]: { min: 18, max: 20 },
} as const;

// Couleurs pour les badges
export const CECRL_COLORS = {
  [CECRL_LEVELS.A1_MINUS]: 'gray',
  [CECRL_LEVELS.A1]: 'red',
  [CECRL_LEVELS.A2]: 'orange',
  [CECRL_LEVELS.A2_PLUS]: 'yellow',
  [CECRL_LEVELS.B1]: 'blue',
  [CECRL_LEVELS.B2]: 'indigo',
  [CECRL_LEVELS.C1]: 'purple',
  [CECRL_LEVELS.C2]: 'green',
} as const;