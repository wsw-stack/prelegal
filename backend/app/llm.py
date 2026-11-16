"""The LLM gateway: the only module that talks to LiteLLM.

Calls go through OpenRouter with Cerebras as the inference provider, and use
Structured Outputs so replies parse straight into a Pydantic model.
"""

import logging
import os
from typing import TypeVar

import litellm
from pydantic import BaseModel

from app import config

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMNotConfigured(Exception):
    """OPENROUTER_API_KEY is not set."""


class LLMError(Exception):
    """The LLM call failed or returned something that doesn't fit the schema."""


def complete_structured(messages: list[dict], response_model: type[T]) -> T:
    """Send `messages` to the model and parse its reply as `response_model`."""
    # Read at call time, so the key can be added without rebuilding the app.
    if not os.getenv("OPENROUTER_API_KEY"):
        raise LLMNotConfigured("OPENROUTER_API_KEY is not set")
    try:
        response = litellm.completion(
            model=config.LLM_MODEL,
            messages=messages,
            response_format=response_model,
            reasoning_effort="low",
            extra_body=config.LLM_EXTRA_BODY,
            timeout=config.LLM_TIMEOUT_SECONDS,
        )
        return response_model.model_validate_json(response.choices[0].message.content or "")
    except Exception as e:
        logger.exception("LLM call failed")
        raise LLMError("LLM call failed") from e
