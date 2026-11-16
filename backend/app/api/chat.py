"""AI chat that fills in the Mutual NDA.

Stateless: the browser sends the conversation so far and the current fields on
every turn, and gets back the assistant's reply and the updated fields.
"""

from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import Field

from app import llm
from app.nda import CamelModel, NdaChatTurn, NdaFields, system_prompt

router = APIRouter()


class ChatMessage(CamelModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(CamelModel):
    # Bounded, since the whole conversation is sent to the model on every turn.
    messages: list[ChatMessage] = Field(min_length=1, max_length=60)
    fields: NdaFields


# A sync route: LiteLLM's completion() blocks, so FastAPI runs this in a thread.
@router.post("/chat")
def chat(request: ChatRequest) -> NdaChatTurn:
    messages = [
        {"role": "system", "content": system_prompt(request.fields)},
        *(m.model_dump() for m in request.messages),
    ]
    try:
        return llm.complete_structured(messages, NdaChatTurn)
    except llm.LLMNotConfigured:
        raise HTTPException(status_code=503, detail="The AI assistant is not configured. Set OPENROUTER_API_KEY.")
    except llm.LLMError:
        raise HTTPException(status_code=502, detail="The AI assistant didn't respond. Please try again.")
