import logging

from app.services.models_adapters.base import ModelAdapter, ModelResponse

logger = logging.getLogger(__name__)

_adapters: dict[str, ModelAdapter] = {}


def register_adapter(adapter: ModelAdapter):
    _adapters[adapter.provider_name] = adapter


def get_adapter(provider: str) -> ModelAdapter:
    adapter = _adapters.get(provider)
    if adapter is None:
        raise ValueError(f"Unknown model provider: {provider}. Available: {list(_adapters.keys())}")
    return adapter


async def chat_with_fallback(
    primary_provider: str,
    primary_model: str,
    fallback_provider: str | None,
    fallback_model: str | None,
    messages: list[dict],
    system_prompt: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 4096,
) -> ModelResponse:
    """Try primary model, fall back to secondary on failure."""
    try:
        adapter = get_adapter(primary_provider)
        return await adapter.chat(messages, primary_model, temperature, max_tokens, system_prompt)
    except Exception as e:
        logger.warning(f"Primary model {primary_provider}/{primary_model} failed: {e}")
        if fallback_provider and fallback_model:
            logger.info(f"Falling back to {fallback_provider}/{fallback_model}")
            adapter = get_adapter(fallback_provider)
            return await adapter.chat(messages, fallback_model, temperature, max_tokens, system_prompt)
        raise


def init_adapters():
    from app.services.models_adapters.anthropic_adapter import AnthropicAdapter
    from app.services.models_adapters.google_adapter import GoogleAdapter
    from app.services.models_adapters.mistral_adapter import MistralAdapter
    from app.services.models_adapters.ollama_adapter import OllamaAdapter
    from app.services.models_adapters.openai_adapter import OpenAIAdapter

    register_adapter(OpenAIAdapter())
    register_adapter(AnthropicAdapter())
    register_adapter(GoogleAdapter())
    register_adapter(MistralAdapter())
    register_adapter(OllamaAdapter())
