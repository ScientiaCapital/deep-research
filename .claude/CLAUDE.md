# Deep Research

**Product**: Deep Research
**Company**: Scientia Capital
**Status**: Production ✅
**URL**: https://perplexity-agent.vercel.app

AI research assistant. Free for Scientia Capital clients.

---

## Rules

- **NO OpenAI models** - Chinese LLMs only
- API keys in `.env` only - never hardcode
- Model names **IP PROTECTED** - never show to users
- Generic names only: "Code Expert", "Deep Analysis", "Quick Response"

---

## Production Model Stack (LOCKED)

| Use Case | Model | Cost | vs GPT-4 |
|----------|-------|------|----------|
| **Code** | `qwen/qwen-2.5-coder-32b-instruct` | $0.07/M | **142x cheaper** |
| **Reasoning** | `deepseek/deepseek-r1-0528` | $0.55/M | **27x cheaper** |
| **General** | `deepseek/deepseek-chat-v3.1` | $0.20/M | **25x cheaper** |
| **Extended** | `qwen/qwen-2.5-72b-instruct` | $0.30/M | **17x cheaper** |
| **Vision** | `qwen/qwen-2-vl-72b-instruct` | TBD | Best open VLM |

---

## What's Built ✅

1. **Smart Chat** - Auto-picks best model for your question
2. **64 Fun Prompts** - Shuffle on each "New Chat"
3. **Streaming** - See answers as they type
4. **Cost Tracking Hook** - Ready for ai-cost-optimizer

---

## What Needs Building 🔨

### 1. Python Agent Backend (scaffolded, needs setup)
```
backend/
├── agent.py      # LangGraph agent (done)
├── main.py       # FastAPI server (done)
└── requirements.txt
```

**To finish:**
```bash
# Create fresh Python 3.10+ venv
python3.10 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Add to .env
TAVILY_API_KEY=xxx  # Get free at tavily.com
```

### 2. Connect Frontend to Agent
- Add toggle: "Quick Answer" vs "Deep Research"
- Deep Research uses Python backend with web search

### 3. Supabase Setup
- Run `supabase/schema.sql` in SQL Editor

---

## Commands

```bash
# Frontend
npm run dev
npm run build
vercel --prod

# Backend (after venv setup)
cd backend && uvicorn main:app --reload
```

---

## Key Files

| File | What it does |
|------|--------------|
| `lib/openrouter.ts` | Model configs |
| `lib/model-selector.ts` | Picks model based on question |
| `app/api/chat/route.ts` | Chat API |
| `app/chat/page.tsx` | Chat UI + 64 prompts |
| `backend/agent.py` | LangGraph agent |
| `backend/main.py` | Python API server |

---

## Environment Variables

```env
# Required now
OPENROUTER_API_KEY=xxx

# For Python agent (later)
TAVILY_API_KEY=xxx

# For LangSmith tracing (optional)
LANGCHAIN_API_KEY=xxx
LANGCHAIN_TRACING_V2=true
```

---

## ai-cost-optimizer Integration

Usage events logged in format:
```json
{
  "project": "deep-research",
  "model": "qwen/qwen-2.5-coder-32b-instruct",
  "category": "code",
  "queryLength": 45,
  "timestamp": "2024-11-27T..."
}
```

Future: POST to ai-cost-optimizer API for cross-project intelligence.
