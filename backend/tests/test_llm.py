from types import SimpleNamespace

import pytest
from pydantic import BaseModel

from app import config, llm


class Answer(BaseModel):
    value: int


def fake_response(content: str | None):
    return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=content))])


@pytest.fixture
def api_key(monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")


def test_raises_not_configured_without_an_api_key():
    with pytest.raises(llm.LLMNotConfigured):
        llm.complete_structured([{"role": "user", "content": "hi"}], Answer)


def test_calls_cerebras_via_openrouter_with_structured_output(api_key, monkeypatch):
    calls = []

    def completion(**kwargs):
        calls.append(kwargs)
        return fake_response('{"value": 42}')

    monkeypatch.setattr("litellm.completion", completion)
    messages = [{"role": "user", "content": "hi"}]

    assert llm.complete_structured(messages, Answer) == Answer(value=42)
    assert calls == [
        {
            "model": "openrouter/openai/gpt-oss-120b",
            "messages": messages,
            "response_format": Answer,
            "reasoning_effort": "low",
            "extra_body": {"provider": {"order": ["cerebras"]}},
            "timeout": config.LLM_TIMEOUT_SECONDS,
        }
    ]


@pytest.mark.parametrize("content", ['{"value": "nope"}', "not json", None])
def test_wraps_unparseable_replies_in_llm_error(api_key, monkeypatch, content):
    monkeypatch.setattr("litellm.completion", lambda **kwargs: fake_response(content))
    with pytest.raises(llm.LLMError):
        llm.complete_structured([], Answer)


def test_wraps_provider_failures_in_llm_error(api_key, monkeypatch):
    def completion(**kwargs):
        raise TimeoutError("provider timed out")

    monkeypatch.setattr("litellm.completion", completion)
    with pytest.raises(llm.LLMError):
        llm.complete_structured([], Answer)
