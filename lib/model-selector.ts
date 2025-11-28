import { MODELS, type ModelId } from './openrouter'

interface SelectionResult {
  model: ModelId
  reason: string
}

/**
 * Intelligently selects the best model based on query characteristics.
 *
 * Selection logic:
 * - Code queries → Qwen Coder (specialized)
 * - Deep reasoning → DeepSeek R1 (best reasoning)
 * - Quick questions → Qwen 72B (fast, cheap)
 * - Long conversations → DeepSeek Chat (128k context)
 */
export function selectModel(
  query: string,
  conversationLength: number = 0
): SelectionResult {
  const lowerQuery = query.toLowerCase()

  // Code-related patterns
  const codePatterns = [
    /\bcode\b/i,
    /\bfunction\b/i,
    /\bimplement\b/i,
    /\bdebug\b/i,
    /\bfix\s+(the|this|a)?\s*(bug|error|issue)/i,
    /\bwrite\s+(a|the)?\s*(script|program|function)/i,
    /\brefactor/i,
    /\bpython\b/i,
    /\bjavascript\b/i,
    /\btypescript\b/i,
    /\breact\b/i,
    /```/,  // Code blocks
  ]

  // Deep reasoning patterns
  const reasoningPatterns = [
    /\banalyze\b/i,
    /\bcompare\b/i,
    /\bexplain\s+why\b/i,
    /\bdeep\s+dive\b/i,
    /\bresearch\b/i,
    /\bwhat\s+are\s+the\s+(pros|cons|advantages|disadvantages)/i,
    /\bhow\s+does\s+.+\s+work/i,
    /\bbreak\s*down\b/i,
    /\bcritical\s*(thinking|analysis)/i,
    /\bevaluate\b/i,
  ]

  // Check for code queries
  if (codePatterns.some(pattern => pattern.test(query))) {
    return {
      model: MODELS.QWEN_CODER,
      reason: 'Code-related query detected',
    }
  }

  // Check for complex reasoning
  if (reasoningPatterns.some(pattern => pattern.test(lowerQuery))) {
    return {
      model: MODELS.DEEPSEEK_R1,
      reason: 'Complex reasoning/analysis detected',
    }
  }

  // Long conversations need better context handling
  if (conversationLength > 10) {
    return {
      model: MODELS.DEEPSEEK_CHAT,
      reason: 'Long conversation - using 128k context model',
    }
  }

  // Very long queries might need deeper thought
  if (query.length > 500) {
    return {
      model: MODELS.DEEPSEEK_R1,
      reason: 'Complex query detected',
    }
  }

  // Default to fast model for simple queries
  return {
    model: MODELS.QWEN_72B,
    reason: 'General query - using fast model',
  }
}

/**
 * Gets the system prompt based on the selected model
 */
export function getSystemPrompt(model: ModelId): string {
  const basePrompt = `You are a helpful AI research assistant. You provide accurate, well-sourced information.

When providing information:
- Be concise but thorough
- Cite sources when available
- Acknowledge uncertainty
- Structure responses clearly with headers and bullet points when appropriate`

  if (model === MODELS.QWEN_CODER) {
    return `${basePrompt}

You specialize in coding tasks. When writing code:
- Include comments explaining the logic
- Follow best practices for the language
- Consider edge cases
- Suggest tests when appropriate`
  }

  if (model === MODELS.DEEPSEEK_R1) {
    return `${basePrompt}

For complex analysis:
- Break down problems step by step
- Consider multiple perspectives
- Identify assumptions and limitations
- Provide actionable insights`
  }

  return basePrompt
}
