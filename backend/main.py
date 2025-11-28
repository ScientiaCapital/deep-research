"""
Deep Research API Server
Simple endpoint that connects to the LangGraph agent
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

from agent import run_research, agent
from langchain_core.messages import HumanMessage

app = FastAPI(title="Deep Research Agent")

# Allow Next.js frontend to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set to your domain
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    history: list = []


@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat with the research agent"""
    try:
        result = await run_research(request.message, request.history)
        return {"response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Stream responses from the agent"""

    async def generate():
        messages = []
        for msg in request.history:
            messages.append(HumanMessage(content=msg))
        messages.append(HumanMessage(content=request.message))

        async for event in agent.astream_events(
            {"messages": messages},
            version="v2"
        ):
            if event["event"] == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content:
                    yield f"data: {json.dumps({'content': content})}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )


@app.get("/health")
async def health():
    return {"status": "ok", "agent": "Deep Research"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
