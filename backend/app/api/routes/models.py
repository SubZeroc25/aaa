from fastapi import APIRouter

from app.services.models_adapters.registry import get_adapter, _adapters

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/providers")
async def list_providers():
    """List all registered model providers and their availability."""
    providers = []
    for name, adapter in _adapters.items():
        available = await adapter.is_available()
        providers.append({
            "provider": name,
            "available": available,
        })
    return providers


@router.get("/providers/{provider}/status")
async def check_provider(provider: str):
    """Check if a specific provider is available."""
    try:
        adapter = get_adapter(provider)
        available = await adapter.is_available()
        return {"provider": provider, "available": available}
    except ValueError as e:
        return {"provider": provider, "available": False, "error": str(e)}
