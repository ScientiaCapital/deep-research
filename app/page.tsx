import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg">
              🔬
            </div>
            <span className="text-xl font-bold">Deep Research</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Sign In
            </Link>
            <Link
              href="/chat"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Free
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Free for Scientia Capital Clients
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Research smarter with
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              intelligent AI
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Ask anything. Our AI automatically understands your question and delivers the best possible answer—whether you need deep analysis, quick facts, or expert code.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/chat"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity font-semibold text-lg shadow-lg shadow-blue-500/25"
            >
              Start Researching — Free
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold text-lg"
            >
              See How It Works
            </a>
          </div>

          {/* Preview Image Placeholder */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl opacity-20 blur-2xl"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0"></div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 max-w-md">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Compare React and Vue for a startup MVP</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-white text-xs">🔬</div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex-1">
                    <div className="text-xs text-blue-600 dark:text-blue-400 mb-2 font-medium">Deep Research • Analysis Mode</div>
                    <p className="text-sm text-gray-700 dark:text-gray-200">Based on my analysis of both frameworks for startup contexts...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 px-4 bg-white dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How it works</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Just ask your question. Our AI handles the rest.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🧠',
                title: 'Deep Analysis',
                subtitle: 'Complex Questions',
                description: 'Need to understand why something works? Want a thorough comparison? Get comprehensive, well-reasoned answers.',
              },
              {
                icon: '💻',
                title: 'Code Expert',
                subtitle: 'Technical Tasks',
                description: 'From debugging to building new features—get clean, documented code that actually works.',
              },
              {
                icon: '⚡',
                title: 'Instant Answers',
                subtitle: 'Quick Questions',
                description: 'Simple questions get fast, accurate responses. No waiting around for basic information.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="relative group p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm mb-3">{feature.subtitle}</p>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center text-white text-sm">
              🔬
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Deep Research — A Scientia Capital Product
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Enterprise-grade AI research for professionals.
          </div>
        </div>
      </footer>
    </div>
  )
}
