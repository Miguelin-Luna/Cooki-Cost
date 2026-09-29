from fastapi import APIRouter
from app.api.v1 import ingredients, recipes, overheads

api_router = APIRouter()
api_router.include_router(ingredients.router, prefix="/ingredients", tags=["ingredients"])
api_router.include_router(recipes.router, prefix="/recipes", tags=["recipes"])
api_router.include_router(overheads.router, prefix="/overheads", tags=["overheads"])
