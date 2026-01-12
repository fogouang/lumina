export const AI_PROVIDERS = {
  GROK: 'grok',
  GEMINI: 'gemini',
  CLAUDE: 'claude',
} as const;

export type AIProvider = (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS];

export const AI_PROVIDER_NAMES = {
  [AI_PROVIDERS.GROK]: 'Grok (xAI)',
  [AI_PROVIDERS.GEMINI]: 'Gemini (Google)',
  [AI_PROVIDERS.CLAUDE]: 'Claude (Anthropic)',
} as const;