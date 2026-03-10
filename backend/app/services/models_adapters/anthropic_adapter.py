import httpx

from app.core.config import settings
from app.services.models_adapters.base import ModelAdapter, ModelResponse


class AnthropicAdapter(ModelAdapter):
    provider_name = "anthropic"

    def __init__(self):
        self.api_key = settings.anthropic_api_key
        self.base_url = "https://api.anthropic.com/v1"

    async def chat(
        self,
        messages: list[dict],
        model: str = "claude-sonnet-4-6",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        system_prompt: str | None = None,
    ) -> ModelResponse:
        body: dict = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        if system_prompt:
            body["system"] = system_prompt

        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{self.base_url}/messages",
                headers={
                    "x-api-key": self.api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json=body,
            )
            resp.raise_for_status()
            data = resp.json()

        usage = data.get("usage", {})
        content_blocks = data.get("content", [])
        text = "".join(b["text"] for b in content_blocks if b["type"] == "text")

        return ModelResponse(
            content=text,
            prompt_tokens=usage.get("input_tokens", 0),
            completion_tokens=usage.get("output_tokens", 0),
            total_tokens=usage.get("input_tokens", 0) + usage.get("output_tokens", 0),
            model_id=model,
            provider=self.provider_name,
        )

    async def is_available(self) -> bool:
        return bool(self.api_key)
