import {
  MODELS,
  FALLBACK_CHAINS,
  getModelDisplayInfo,
  type ModelCategory,
} from './openrouter'

/**
 * Selection result with fallback chain for auto-failover
 */
export interface SelectionResult {
  model: string
  fallbacks: string[]
  reason: string
  category: ModelCategory
}

// ============================================
// CODE DETECTION PATTERNS
// ============================================
const CODE_PATTERNS = [
  // Explicit code keywords
  /\b(code|function|implement|debug|refactor|script|program|algorithm)\b/i,

  // Programming languages
  /\b(python|javascript|typescript|react|vue|angular|java|rust|go|c\+\+|ruby|php|swift|kotlin)\b/i,

  // Code blocks in message
  /```/,

  // Bug/error fixing
  /\b(fix|solve|patch)\s+(the|this|a|my)?\s*(bug|error|issue|problem)/i,

  // Technical terms
  /\b(api|endpoint|database|query|sql|json|xml|html|css)\b/i,

  // Development actions
  /\b(write|create|build|generate)\s+(a|the|some)?\s*(code|function|class|component|module)/i,
]

// ============================================
// REASONING DETECTION PATTERNS
// ============================================
const REASONING_PATTERNS = [
  // Analysis keywords
  /\b(analyze|compare|evaluate|assess|examine|critique|review)\b/i,

  // Explanation requests
  /\b(explain\s+(why|how)|how\s+does\s+.+\s+work|what\s+causes)\b/i,

  // Trade-off discussions
  /\b(pros|cons|advantages|disadvantages|trade-?offs|benefits|drawbacks)\b/i,

  // Research requests
  /\b(research|investigate|deep\s*dive|break\s*down|summarize)\b/i,

  // Complex thinking
  /\b(implications|consequences|considerations|factors|aspects)\b/i,

  // Strategic planning
  /\b(strategy|approach|methodology|framework|architecture)\b/i,
]

/**
 * Intelligently selects the optimal model based on query characteristics.
 *
 * Selection Logic:
 * 1. Vision queries → Qwen VL 72B
 * 2. Code queries → Qwen Coder 32B (142x cheaper than GPT-4)
 * 3. Reasoning queries → DeepSeek R1 (27x cheaper than o1)
 * 4. Long conversations → Qwen 72B (128k context)
 * 5. General queries → DeepSeek Chat V3.1 (fast, cheap)
 */
export function selectModel(
  query: string,
  conversationLength: number = 0,
  hasImages: boolean = false
): SelectionResult {
  // ============================================
  // VISION: Image content takes priority
  // ============================================
  if (hasImages) {
    return {
      model: MODELS.VISION,
      fallbacks: FALLBACK_CHAINS.vision,
      reason: 'Image content detected',
      category: 'vision',
    }
  }

  const queryLower = query.toLowerCase()

  // ============================================
  // CODE: Programming-related queries
  // ============================================
  if (CODE_PATTERNS.some((pattern) => pattern.test(query))) {
    return {
      model: MODELS.CODE,
      fallbacks: FALLBACK_CHAINS.code,
      reason: 'Code-related query',
      category: 'code',
    }
  }

  // ============================================
  // REASONING: Complex analysis queries
  // ============================================
  if (REASONING_PATTERNS.some((pattern) => pattern.test(queryLower))) {
    return {
      model: MODELS.REASONING,
      fallbacks: FALLBACK_CHAINS.reasoning,
      reason: 'Complex reasoning detected',
      category: 'reasoning',
    }
  }

  // ============================================
  // LONG QUERIES: Often need deeper thought
  // ============================================
  if (query.length > 500) {
    return {
      model: MODELS.REASONING,
      fallbacks: FALLBACK_CHAINS.reasoning,
      reason: 'Complex query detected',
      category: 'reasoning',
    }
  }

  // ============================================
  // EXTENDED CONTEXT: Long conversations
  // ============================================
  if (conversationLength > 15) {
    return {
      model: MODELS.EXTENDED,
      fallbacks: [MODELS.GENERAL],
      reason: 'Long conversation context',
      category: 'general',
    }
  }

  // ============================================
  // DEFAULT: Fast DeepSeek Chat for general queries
  // ============================================
  return {
    model: MODELS.GENERAL,
    fallbacks: FALLBACK_CHAINS.general,
    reason: 'General query',
    category: 'general',
  }
}

/**
 * Gets the system prompt tailored to the selected model category
 */
export function getSystemPrompt(category: ModelCategory): string {
  const basePrompt = `You are Deep Research, an AI research assistant that provides accurate, well-sourced information.

Core principles:
- Be concise but thorough
- Cite sources when available
- Acknowledge uncertainty
- Structure responses with headers and bullet points when helpful`

  switch (category) {
    case 'code':
      return `${basePrompt}

You specialize in coding tasks. When writing code:
- Include comments explaining complex logic
- Follow best practices for the language
- Consider edge cases and error handling
- Suggest tests when appropriate
- Use modern syntax and patterns`

    case 'reasoning':
      return `${basePrompt}

For complex analysis:
- Break down problems step by step
- Consider multiple perspectives and trade-offs
- Identify assumptions and limitations
- Provide actionable insights
- Support conclusions with evidence`

    case 'vision':
      return `${basePrompt}

When analyzing images:
- Describe what you observe in detail
- Identify key elements and patterns
- Provide context when relevant
- Answer questions about specific parts of the image`

    default:
      return basePrompt
  }
}

/**
 * Gets display info for the selected model (IP protected)
 */
export function getSelectionDisplayInfo(selection: SelectionResult): { name: string; icon: string } {
  return getModelDisplayInfo(selection.model)
}
