import OpenAI from 'openai'

// OpenRouter client - OpenAI-compatible API for all models
export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'Perplexity Agent',
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

// Model metadata for display
export const MODEL_INFO: Record<ModelId, { name: string; description: string; icon: string }> = {
  [MODELS.DEEPSEEK_R1]: {
    name: 'DeepSeek R1',
    description: 'Best for complex reasoning & analysis',
    icon: '🧠',
  },
  [MODELS.DEEPSEEK_CHAT]: {
    name: 'DeepSeek Chat',
    description: 'Fast general chat with 128k context',
    icon: '💬',
  },
  [MODELS.QWEN_CODER]: {
    name: 'Qwen Coder',
    description: 'Specialized for code tasks',
    icon: '💻',
  },
  [MODELS.QWEN_72B]: {
    name: 'Qwen 72B',
    description: 'Fast & efficient for quick queries',
    icon: '⚡',
  },
  [MODELS.LLAMA_405B]: {
    name: 'Llama 405B',
    description: 'Most powerful fallback',
    icon: '🦙',
  },
}
