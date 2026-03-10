from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class ModelResponse:
    content: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    model_id: str = ""
    provider: str = ""
    metadata: dict = field(default_factory=dict)


class ModelAdapter(ABC):
    """Base adapter for all model providers."""

    provider_name: str = ""

    @abstractmethod
    async def chat(
        self,
        messages: list[dict],
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        system_prompt: str | None = None,
    ) -> ModelResponse:
        """Send a chat completion request."""
        ...

    @abstractmethod
    async def is_available(self) -> bool:
        """Check if the provider is configured and reachable."""
        ...

    async def stream_chat(
        self,
        messages: list[dict],
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        system_prompt: str | None = None,
    ):
        """Stream a chat completion. Default falls back to non-streaming."""
        result = await self.chat(messages, model, temperature, max_tokens, system_prompt)
        yield result
