import OpenAI from 'openai'

// OpenRouter client - OpenAI-compatible API for all models
export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'Deep Research',
  },
})

// Available models via OpenRouter
export const MODELS = {
  // Deep reasoning - best for complex analysis
  DEEPSEEK_R1: 'deepseek/deepseek-r1',

  // Fast general chat
  DEEPSEEK_CHAT: 'deepseek/deepseek-chat',

  // Coding specialist
  QWEN_CODER: 'qwen/qwen-2.5-coder-32b-instruct',

  // Fast general purpose
  QWEN_72B: 'qwen/qwen-2.5-72b-instruct',

  // Fallback - powerful but expensive
  LLAMA_405B: 'meta-llama/llama-3.1-405b-instruct',
} as const

export type ModelId = typeof MODELS[keyof typeof MODELS]

// Model metadata for display - generic names to protect IP
export const MODEL_INFO: Record<ModelId, { name: string; description: string; icon: string }> = {
  [MODELS.DEEPSEEK_R1]: {
    name: 'Deep Analysis',
    description: 'Complex reasoning mode',
    icon: '🧠',
  },
  [MODELS.DEEPSEEK_CHAT]: {
    name: 'Extended Context',
    description: 'Long conversation mode',
    icon: '💬',
  },
  [MODELS.QWEN_CODER]: {
    name: 'Code Expert',
    description: 'Technical mode',
    icon: '💻',
  },
  [MODELS.QWEN_72B]: {
    name: 'Quick Response',
    description: 'Fast mode',
    icon: '⚡',
  },
  [MODELS.LLAMA_405B]: {
    name: 'Advanced',
    description: 'High capability mode',
    icon: '🔬',
  },
}
