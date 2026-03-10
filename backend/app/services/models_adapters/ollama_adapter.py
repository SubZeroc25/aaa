import httpx

from app.core.config import settings
from app.services.models_adapters.base import ModelAdapter, ModelResponse


class OllamaAdapter(ModelAdapter):
    provider_name = "ollama"

    def __init__(self):
        self.base_url = settings.ollama_base_url

    async def chat(
        self,
        messages: list[dict],
        model: str = "llama3",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        system_prompt: str | None = None,
    ) -> ModelResponse:
        msgs = []
        if system_prompt:
            msgs.append({"role": "system", "content": system_prompt})
        msgs.extend(messages)

        async with httpx.AsyncClient(timeout=300) as client:
            resp = await client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": model,
                    "messages": msgs,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens,
                    },
                },
            )
            resp.raise_for_status()
            data = resp.json()

        return ModelResponse(
            content=data["message"]["content"],
            prompt_tokens=data.get("prompt_eval_count", 0),
            completion_tokens=data.get("eval_count", 0),
            total_tokens=data.get("prompt_eval_count", 0) + data.get("eval_count", 0),
            model_id=model,
            provider=self.provider_name,
        )

    async def is_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                return resp.status_code == 200
        except Exception:
            return False
