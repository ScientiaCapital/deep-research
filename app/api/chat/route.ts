import { openrouter, MODEL_INFO } from '@/lib/openrouter'
import { selectModel, getSystemPrompt } from '@/lib/model-selector'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

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

    // Select the best model for this query
    const { model, reason } = selectModel(
      latestUserMessage.content,
      messages.length
    )

    console.log(`Selected model: ${model} - ${reason}`)

    // Get appropriate system prompt
    const systemPrompt = getSystemPrompt(model)

    // Build messages array with system prompt
    const chatMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // Create streaming response
    const response = await openrouter.chat.completions.create({
      model,
      messages: chatMessages,
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
    })

    // Create a readable stream for the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Send model info first
        const modelInfo = MODEL_INFO[model]
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'model_info',
              model,
              name: modelInfo.name,
              icon: modelInfo.icon,
              reason,
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
    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        details: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
