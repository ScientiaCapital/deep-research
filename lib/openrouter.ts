import OpenAI from 'openai'

// OpenRouter client - Unified API for Chinese LLMs
export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'Deep Research',
  },
})

// ============================================
// PRODUCTION MODEL STACK - Chinese LLMs
// No FREE tier (rate limited) - use paid for scale
// Still 27-142x cheaper than Western models
// ============================================

export const MODELS = {
  // ----------------------------------------
  // REASONING - Complex analysis, research
  // ----------------------------------------
  // DeepSeek R1 0528 - Latest, best reasoning
  // $0.55/M input, $2.19/M output (27x cheaper than o1)
  REASONING: 'deepseek/deepseek-r1-0528',

  // ----------------------------------------
  // CODE - Programming, debugging, technical
  // ----------------------------------------
  // Qwen 2.5 Coder 32B - Best open-source code model
  // $0.07/M input (142x cheaper than GPT-4-turbo!)
  CODE: 'qwen/qwen-2.5-coder-32b-instruct',

  // ----------------------------------------
  // GENERAL - Fast responses, chat
  // ----------------------------------------
  // DeepSeek Chat V3.1 - Fast, 128k context
  // $0.20/M input, $0.80/M output (25x cheaper than GPT-4o)
  GENERAL: 'deepseek/deepseek-chat-v3.1',

  // ----------------------------------------
  // EXTENDED - Long conversations
  // ----------------------------------------
  // Qwen 72B - 128k context, great quality
  // $0.30/M input (17x cheaper than GPT-4o)
  EXTENDED: 'qwen/qwen-2.5-72b-instruct',

  // ----------------------------------------
  // VISION - Image understanding
  // ----------------------------------------
  // Qwen2 VL 72B - Best open-source VLM
  VISION: 'qwen/qwen-2-vl-72b-instruct',

  // ----------------------------------------
  // MOONSHOT - Alternative for variety
  // ----------------------------------------
  // Kimi K2 - MoonshotAI's flagship
  MOONSHOT: 'moonshotai/kimi-k2',
} as const

// ============================================
// MODEL CATEGORIES
// ============================================
export type ModelCategory = 'reasoning' | 'code' | 'general' | 'vision'

export type ModelId = typeof MODELS[keyof typeof MODELS]

// ============================================
// FALLBACK CHAINS (Auto-failover)
// If primary has issues, try next model
// ============================================
export const FALLBACK_CHAINS: Record<ModelCategory, string[]> = {
  reasoning: [MODELS.REASONING, MODELS.EXTENDED, MODELS.GENERAL],
  code: [MODELS.CODE, MODELS.GENERAL],
  general: [MODELS.GENERAL, MODELS.EXTENDED],
  vision: [MODELS.VISION],
}

// ============================================
// MODEL INFO - Generic names (IP PROTECTED)
// Never expose actual model names to end users
// ============================================
export const MODEL_INFO: Record<string, { name: string; icon: string; category: ModelCategory }> = {
  [MODELS.REASONING]: { name: 'Deep Analysis', icon: '🧠', category: 'reasoning' },
  [MODELS.CODE]: { name: 'Code Expert', icon: '💻', category: 'code' },
  [MODELS.GENERAL]: { name: 'Quick Response', icon: '⚡', category: 'general' },
  [MODELS.EXTENDED]: { name: 'Extended Context', icon: '📚', category: 'general' },
  [MODELS.VISION]: { name: 'Vision Mode', icon: '👁️', category: 'vision' },
  [MODELS.MOONSHOT]: { name: 'Research Mode', icon: '🔬', category: 'general' },
}

// Helper to get display info (safe for frontend - IP protected)
export function getModelDisplayInfo(modelId: string): { name: string; icon: string } {
  const info = MODEL_INFO[modelId]
  if (info) {
    return { name: info.name, icon: info.icon }
  }
  // Fallback for unknown models - never expose actual model ID
  return { name: 'AI Assistant', icon: '🤖' }
}

// ============================================
// COST COMPARISON (Why Chinese LLMs)
// ============================================
// | Model          | Our Cost   | GPT-4 Equiv | Margin |
// |----------------|------------|-------------|--------|
// | DeepSeek R1    | $0.55/M    | o1 $15/M    | 27x    |
// | Qwen Coder 32B | $0.07/M    | GPT-4 $10/M | 142x   |
// | DeepSeek Chat  | $0.20/M    | GPT-4o $5/M | 25x    |
// | Qwen 72B       | $0.30/M    | GPT-4o $5/M | 17x    |
// ============================================
