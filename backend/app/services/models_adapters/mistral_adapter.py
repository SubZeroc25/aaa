import httpx

from app.core.config import settings
from app.services.models_adapters.base import ModelAdapter, ModelResponse


class MistralAdapter(ModelAdapter):
    provider_name = "mistral"

    def __init__(self):
        self.api_key = settings.mistral_api_key
        self.base_url = "https://api.mistral.ai/v1"

    async def chat(
        self,
        messages: list[dict],
        model: str = "mistral-large-latest",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        system_prompt: str | None = None,
    ) -> ModelResponse:
        msgs = []
        if system_prompt:
            msgs.append({"role": "system", "content": system_prompt})
        msgs.extend(messages)

        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": model,
                    "messages": msgs,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        usage = data.get("usage", {})
        return ModelResponse(
            content=data["choices"][0]["message"]["content"],
            prompt_tokens=usage.get("prompt_tokens", 0),
            completion_tokens=usage.get("completion_tokens", 0),
            total_tokens=usage.get("total_tokens", 0),
            model_id=model,
            provider=self.provider_name,
        )

    async def is_available(self) -> bool:
        return bool(self.api_key)
