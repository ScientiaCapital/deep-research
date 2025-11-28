'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

// 50+ fun prompts across all categories
const ALL_SUGGESTIONS = [
  // 🔬 Science & Learning
  { icon: '🔬', text: 'Explain quantum computing like I\'m 12' },
  { icon: '🧬', text: 'How does CRISPR gene editing actually work?' },
  { icon: '🌌', text: 'What would happen if you fell into a black hole?' },
  { icon: '🧪', text: 'Why does mixing baking soda and vinegar explode?' },
  { icon: '🦠', text: 'How do vaccines train your immune system?' },
  { icon: '⚡', text: 'Explain electricity like I\'ve never seen it' },
  { icon: '🌊', text: 'Why is the ocean salty but lakes aren\'t?' },
  { icon: '🌋', text: 'What causes earthquakes and can we predict them?' },
  { icon: '🧠', text: 'How does memory actually work in the brain?' },
  { icon: '🔭', text: 'Is time travel theoretically possible?' },

  // 💻 Code & Tech
  { icon: '💻', text: 'Write a Python function to check if a number is prime' },
  { icon: '🐍', text: 'Explain Python decorators with a simple example' },
  { icon: '⚛️', text: 'Build a React hook for dark mode toggle' },
  { icon: '🗄️', text: 'Write a SQL query to find duplicate emails' },
  { icon: '🔐', text: 'How do I hash passwords securely in Node.js?' },
  { icon: '📱', text: 'Create a responsive navbar in CSS' },
  { icon: '🤖', text: 'Write a Discord bot that responds to commands' },
  { icon: '🎮', text: 'Simple JavaScript game loop explained' },
  { icon: '📊', text: 'Parse a CSV file in Python with pandas' },
  { icon: '🔧', text: 'Fix: "Cannot read property of undefined"' },
  { icon: '🚀', text: 'Deploy a Next.js app to Vercel step by step' },
  { icon: '🐳', text: 'Explain Docker containers like I\'m 5' },

  // 📊 Business & Strategy
  { icon: '📈', text: 'Compare React vs Vue vs Svelte for a startup' },
  { icon: '💼', text: 'Write a cold email that actually gets replies' },
  { icon: '🎯', text: 'How do I validate a startup idea quickly?' },
  { icon: '💰', text: 'Explain stock options like I just got a job offer' },
  { icon: '📋', text: 'Create a product roadmap template' },
  { icon: '🤝', text: 'How to negotiate salary: a script' },
  { icon: '📉', text: 'Why do most startups fail?' },
  { icon: '🏢', text: 'Remote vs office work: honest pros and cons' },

  // 🎨 Creative & Fun
  { icon: '🎬', text: 'Explain the movie Inception in one paragraph' },
  { icon: '🎵', text: 'Why do some songs get stuck in your head?' },
  { icon: '🎨', text: 'How to pick colors that look good together' },
  { icon: '📚', text: 'Summarize "Atomic Habits" key points' },
  { icon: '🍳', text: 'Perfect scrambled eggs: the science' },
  { icon: '☕', text: 'Why does coffee make you poop?' },
  { icon: '😴', text: 'Why do we dream and what do dreams mean?' },
  { icon: '🐕', text: 'Why do dogs tilt their heads when you talk?' },
  { icon: '🎃', text: 'What\'s the scariest thing in the ocean?' },
  { icon: '🦖', text: 'If dinosaurs were alive today, which would win?' },

  // 🧠 Deep Thinking
  { icon: '🤔', text: 'Is free will real or just an illusion?' },
  { icon: '🌍', text: 'Why haven\'t we found aliens yet?' },
  { icon: '⏰', text: 'Why does time feel faster as you get older?' },
  { icon: '🪞', text: 'What makes something "art"?' },
  { icon: '💭', text: 'Can AI ever truly be conscious?' },
  { icon: '🎲', text: 'Is luck real or just math we don\'t see?' },
  { icon: '🧩', text: 'Why are some people naturally good at math?' },
  { icon: '🌙', text: 'Why do we need sleep? What happens if we don\'t?' },

  // 💡 Life Skills
  { icon: '💡', text: 'How to learn anything faster: proven methods' },
  { icon: '🏋️', text: 'Gym routine for beginners who hate exercise' },
  { icon: '💤', text: 'How to actually fall asleep when you can\'t' },
  { icon: '🧘', text: 'Does meditation actually do anything?' },
  { icon: '📝', text: 'How to write so people actually read it' },
  { icon: '🗣️', text: 'How to be better at small talk' },
  { icon: '🎤', text: 'Overcome fear of public speaking' },
  { icon: '⏱️', text: 'Time management tips that aren\'t obvious' },

  // 🌐 World & History
  { icon: '🗺️', text: 'Why is English spoken worldwide?' },
  { icon: '🏛️', text: 'How did ancient Egyptians build the pyramids?' },
  { icon: '🗽', text: 'Explain US politics like I\'m not American' },
  { icon: '💴', text: 'Why does money have value?' },
  { icon: '🌐', text: 'How does the internet actually work?' },
  { icon: '📡', text: 'How do satellites stay up there?' },
  { icon: '✈️', text: 'How do planes fly? Like really.' },
  { icon: '🚗', text: 'How do self-driving cars see the road?' },
]

// Shuffle and pick random suggestions
function getRandomSuggestions(count: number = 4) {
  const shuffled = [...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  model?: string
  modelIcon?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentModel, setCurrentModel] = useState<{ name: string; icon: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Get random suggestions on mount (client-side only)
  const [suggestions, setSuggestions] = useState<typeof ALL_SUGGESTIONS>([])
  useEffect(() => {
    setSuggestions(getRandomSuggestions(4))
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setCurrentModel(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let assistantContent = ''
      let modelName = ''
      let modelIcon = ''

      // Add placeholder for assistant message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((line) => line.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'model_info') {
              modelName = data.name
              modelIcon = data.icon
              setCurrentModel({ name: modelName, icon: modelIcon })
            } else if (data.type === 'content') {
              assistantContent += data.content
              setMessages((prev) => {
                const newMessages = [...prev]
                const lastIndex = newMessages.length - 1
                newMessages[lastIndex] = {
                  role: 'assistant',
                  content: assistantContent,
                  model: modelName,
                  modelIcon,
                }
                return newMessages
              })
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
      setCurrentModel(null)
      // Auto-focus input so user can type again
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <span className="text-2xl">🔬</span> Deep Research
            </a>
            {currentModel && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full flex items-center gap-1">
                <span>{currentModel.icon}</span>
                <span>{currentModel.name}</span>
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setMessages([])
              setInput('')
              setSuggestions(getRandomSuggestions(4)) // Fresh prompts!
              inputRef.current?.focus()
            }}
            className="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            + New Chat
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                What would you like to research?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">
                Ask anything. Get intelligent, well-researched answers.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion.text)}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-left"
                  >
                    <span className="text-2xl">{suggestion.icon}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-6">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`px-4 ${message.role === 'assistant' ? 'bg-gray-100 dark:bg-gray-800 py-6' : 'py-4'}`}
                >
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-purple-600 text-white'
                        }`}
                      >
                        {message.role === 'user' ? 'U' : message.modelIcon || '🤖'}
                      </div>
                      <div className="flex-1 min-w-0">
                        {message.role === 'assistant' && message.model && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Answered by {message.model}
                          </div>
                        )}
                        <div className="prose dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="px-4 py-6 bg-gray-100 dark:bg-gray-800">
                  <div className="max-w-3xl mx-auto flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <div className="animate-pulse">💭</div>
                    </div>
                    <div className="text-gray-500">Thinking...</div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input */}
      <footer className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-400"
              style={{ maxHeight: '200px' }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-xs text-center text-gray-500">
            AI automatically adapts to your question type
          </p>
        </form>
      </footer>
    </div>
  )
}
