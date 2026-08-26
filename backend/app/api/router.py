from fastapi import APIRouter

from app.api.core import core_router
from app.api.visits import visits_router

api_router = APIRouter()
api_router.include_router(visits_router)
api_router.include_router(core_router)

