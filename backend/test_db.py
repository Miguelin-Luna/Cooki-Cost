import asyncio
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import select
from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient
from app.models.ingredient import Ingredient
from app.models.ingredient_conversion import IngredientConversion

async def test():
    engine = create_async_engine('sqlite+aiosqlite:///./cookicost.db')
    async with AsyncSession(engine) as db:
        result = await db.execute(
            select(Recipe)
            .options(
                selectinload(Recipe.ingredients)
                .joinedload(RecipeIngredient.ingredient)
                .selectinload(Ingredient.conversions)
            )
            .where(Recipe.id == 1)
        )
        recipe = result.scalars().first()
        for ri in recipe.ingredients:
            print(f"{ri.ingredient.name} conversions: {len(ri.ingredient.conversions)}")

asyncio.run(test())