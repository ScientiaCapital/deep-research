import { openrouter, getModelDisplayInfo } from '@/lib/openrouter'
import { selectModel, getSystemPrompt, getSelectionDisplayInfo, type SelectionResult } from '@/lib/model-selector'
import { NextRequest } from 'next/server'
import type { Stream } from 'openai/streaming'
import type { ChatCompletionChunk } from 'openai/resources/chat/completions'

export const runtime = 'edge'

// ============================================
// AI-COST-OPTIMIZER INTEGRATION HOOK
// Tracks model usage for cross-project intelligence
// Future: POST to ai-cost-optimizer API endpoint
// ============================================
interface UsageEvent {
  project: string
  model: string
  category: string
  reason: string
  queryLength: number
  conversationLength: number
  timestamp: string
  // Future fields: tokens_in, tokens_out, latency_ms, success
}

async function trackUsage(selection: SelectionResult, queryLength: number, conversationLength: number): Promise<void> {
  const event: UsageEvent = {
    project: 'deep-research',
    model: selection.model,
    category: selection.category,
    reason: selection.reason,
    queryLength,
    conversationLength,
    timestamp: new Date().toISOString(),
  }

  // Log for now - ai-cost-optimizer will consume this format
  console.log('[Usage Event]', JSON.stringify(event))

  // TODO: When ai-cost-optimizer API is ready:
  // await fetch(process.env.AI_COST_OPTIMIZER_URL + '/api/usage', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(event),
  // }).catch(() => {}) // Fire and forget, don't block response
}

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get the latest user message for model selection
    const latestUserMessage = messages
      .filter((m: any) => m.role === 'user')
      .pop()

    if (!latestUserMessage) {
      return new Response(
        JSON.stringify({ error: 'No user message found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if message contains images (for future vision support)
    const hasImages = Array.isArray(latestUserMessage.content) &&
      latestUserMessage.content.some((part: any) => part.type === 'image_url')

    // Select the best model with fallback chain
    const selection = selectModel(
      typeof latestUserMessage.content === 'string'
        ? latestUserMessage.content
        : latestUserMessage.content[0]?.text || '',
      messages.length,
      hasImages
    )

    console.log(`[Model Selection] Primary: ${selection.model}, Category: ${selection.category}, Reason: ${selection.reason}`)
    console.log(`[Fallback Chain] ${selection.fallbacks.join(' → ')}`)

    // Track usage for ai-cost-optimizer intelligence (fire and forget)
    const queryText = typeof latestUserMessage.content === 'string'
      ? latestUserMessage.content
      : latestUserMessage.content[0]?.text || ''
    trackUsage(selection, queryText.length, messages.length)

    // Get category-appropriate system prompt
    const systemPrompt = getSystemPrompt(selection.category)

    // Build messages array with system prompt
    const chatMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // Create streaming response with fallback chain
    // OpenRouter will automatically try the next model if primary fails
    // Note: 'models' is an OpenRouter extension for fallback chains
    const response = await openrouter.chat.completions.create({
      model: selection.model,
      messages: chatMessages,
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
    }) as Stream<ChatCompletionChunk>

    // Create a readable stream for the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Send model display info (IP PROTECTED - never send actual model ID)
        const displayInfo = getSelectionDisplayInfo(selection)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'model_info',
              name: displayInfo.name,
              icon: displayInfo.icon,
              category: selection.category,
            })}\n\n`
          )
        )

        // Stream the response
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'content', content })}\n\n`
              )
            )
          }
        }

        // Signal completion
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        )
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)

    // Check for specific OpenRouter errors
    if (error.status === 429) {
      return new Response(
        JSON.stringify({
          error: 'Rate limited. Please try again in a moment.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
