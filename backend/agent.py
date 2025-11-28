"""
Deep Research Agent - LangGraph + Chinese LLMs via OpenRouter
Manus-like multi-step research capability
"""

import os
from typing import Annotated, Literal, TypedDict
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from tavily import TavilyClient

load_dotenv()

# ============================================
# CHINESE LLMs VIA OPENROUTER
# Same models as frontend - keep costs low!
# ============================================

MODELS = {
    "reasoning": "deepseek/deepseek-r1-0528",      # Deep thinking
    "general": "deepseek/deepseek-chat-v3.1",     # Fast responses
    "code": "qwen/qwen-2.5-coder-32b-instruct",   # Code tasks
}

def get_llm(model_type: str = "general"):
    """Get Chinese LLM via OpenRouter"""
    return ChatOpenAI(
        model=MODELS.get(model_type, MODELS["general"]),
        openai_api_key=os.getenv("OPENROUTER_API_KEY"),
        openai_api_base="https://openrouter.ai/api/v1",
        default_headers={
            "HTTP-Referer": os.getenv("SITE_URL", "http://localhost:3000"),
            "X-Title": "Deep Research Agent",
        },
        temperature=0.7,
        streaming=True,
    )


# ============================================
# TOOLS - What the agent can do
# ============================================

tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

@tool
def web_search(query: str) -> str:
    """Search the web for current information.
    Use this when you need up-to-date facts, news, or data.
    """
    try:
        results = tavily_client.search(
            query=query,
            search_depth="advanced",
            max_results=5,
        )

        # Format results nicely
        output = []
        for r in results.get("results", []):
            output.append(f"**{r['title']}**\n{r['content']}\nSource: {r['url']}\n")

        return "\n---\n".join(output) if output else "No results found."
    except Exception as e:
        return f"Search error: {str(e)}"


@tool
def think_deeply(question: str) -> str:
    """Take time to think through a complex problem step by step.
    Use this for analysis, comparisons, or when the user asks 'why'.
    """
    llm = get_llm("reasoning")
    response = llm.invoke([
        SystemMessage(content="Think through this step by step. Consider multiple angles."),
        HumanMessage(content=question)
    ])
    return response.content


# ============================================
# AGENT STATE
# ============================================

class AgentState(TypedDict):
    """What the agent knows at each step"""
    messages: list  # Conversation history
    next_action: str  # What to do next


# ============================================
# AGENT GRAPH
# ============================================

tools = [web_search, think_deeply]

def should_continue(state: AgentState) -> Literal["tools", "end"]:
    """Decide if agent should use tools or finish"""
    messages = state["messages"]
    last_message = messages[-1]

    # If AI wants to use tools, let it
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"

    # Otherwise, we're done
    return "end"


def call_model(state: AgentState):
    """Main agent thinking step"""
    llm = get_llm("general").bind_tools(tools)

    system_prompt = """You are Deep Research, an AI that does thorough research.

You have tools to help:
- web_search: Find current information online
- think_deeply: Analyze complex problems step by step

For simple questions, answer directly.
For research questions, use web_search to find facts.
For analysis questions, use think_deeply to reason through it.

Be helpful, accurate, and cite your sources."""

    messages = [SystemMessage(content=system_prompt)] + state["messages"]
    response = llm.invoke(messages)

    return {"messages": [response]}


def build_agent():
    """Create the LangGraph agent"""

    # Create the graph
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", ToolNode(tools))

    # Set entry point
    workflow.set_entry_point("agent")

    # Add edges
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            "end": END,
        }
    )
    workflow.add_edge("tools", "agent")  # After tools, back to thinking

    # Compile
    return workflow.compile()


# Create the agent
agent = build_agent()


async def run_research(query: str, history: list = None):
    """Run research query through the agent"""
    messages = history or []
    messages.append(HumanMessage(content=query))

    result = await agent.ainvoke({"messages": messages})

    return result["messages"][-1].content


# Quick test
if __name__ == "__main__":
    import asyncio

    async def test():
        result = await run_research("What's the latest news about AI?")
        print(result)

    asyncio.run(test())
