import httpx

from app.core.config import settings
from app.services.models_adapters.base import ModelAdapter, ModelResponse


class GoogleAdapter(ModelAdapter):
    provider_name = "google"

    def __init__(self):
        self.api_key = settings.google_api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def chat(
        self,
        messages: list[dict],
        model: str = "gemini-2.0-flash",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        system_prompt: str | None = None,
    ) -> ModelResponse:
        contents = []
        for msg in messages:
            role = "model" if msg["role"] == "assistant" else "user"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})

        body: dict = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            },
        }
        if system_prompt:
            body["systemInstruction"] = {"parts": [{"text": system_prompt}]}

        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(
                f"{self.base_url}/models/{model}:generateContent",
                params={"key": self.api_key},
                json=body,
            )
            resp.raise_for_status()
            data = resp.json()

        text = data["candidates"][0]["content"]["parts"][0]["text"]
        usage = data.get("usageMetadata", {})

        return ModelResponse(
            content=text,
            prompt_tokens=usage.get("promptTokenCount", 0),
            completion_tokens=usage.get("candidatesTokenCount", 0),
            total_tokens=usage.get("totalTokenCount", 0),
            model_id=model,
            provider=self.provider_name,
        )

    async def is_available(self) -> bool:
        return bool(self.api_key)
