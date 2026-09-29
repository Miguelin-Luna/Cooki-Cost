from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from app.api.deps import SessionDep
from app.models.ingredient import Ingredient
from app.models.ingredient_conversion import IngredientConversion
from app.models.ingredient_alias import IngredientAlias
from app.schemas.ingredient import IngredientCreate, IngredientResponse, IngredientUpdate, IngredientAliasCreate, IngredientAliasResponse, IngredientBulkUpdateItem
from app.core.utils import normalize_text

router = APIRouter()

@router.get("/", response_model=List[IngredientResponse])
async def read_ingredients(db: SessionDep):
    result = await db.execute(select(Ingredient).options(selectinload(Ingredient.conversions)))
    return result.scalars().all()

@router.post("/", response_model=IngredientResponse, status_code=status.HTTP_201_CREATED)
async def create_ingredient(ingredient_in: IngredientCreate, db: SessionDep):
    try:
        data = ingredient_in.model_dump()
        conversions_data = data.pop("conversions", []) or []
        db_obj = Ingredient(**data)
        
        for conv in conversions_data:
            db_obj.conversions.append(IngredientConversion(**conv))
            
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Ingredient already exists")

@router.put("/bulk-update", response_model=List[IngredientResponse])
async def bulk_update_ingredients(items: List[IngredientBulkUpdateItem], db: SessionDep):
    updated_ingredients = []
    
    # We fetch all ingredients that are being updated
    item_ids = [item.id for item in items]
    result = await db.execute(
        select(Ingredient).where(Ingredient.id.in_(item_ids)).options(selectinload(Ingredient.conversions))
    )
    db_ingredients = {ing.id: ing for ing in result.scalars().all()}
    
    for item in items:
        if item.id in db_ingredients:
            db_obj = db_ingredients[item.id]
            updated = False
            
            if item.package_quantity is not None and item.package_quantity != db_obj.package_quantity:
                db_obj.package_quantity = item.package_quantity
                updated = True
                
            if item.package_cost is not None and item.package_cost != db_obj.package_cost:
                db_obj.package_cost = item.package_cost
                updated = True
                
            if updated:
                db_obj.last_price_update = datetime.now(timezone.utc)
                updated_ingredients.append(db_obj)
                
    try:
        await db.commit()
        # Refresh the updated objects
        for ing in updated_ingredients:
            await db.refresh(ing)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Error updating ingredients")
        
    # Return only updated ingredients or we can return all that were passed in. Let's return the ones passed.
    return list(db_ingredients.values())

@router.get("/{id}", response_model=IngredientResponse)
async def read_ingredient(id: int, db: SessionDep):
    result = await db.execute(select(Ingredient).where(Ingredient.id == id).options(selectinload(Ingredient.conversions)))
    db_obj = result.scalars().first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return db_obj

@router.put("/{id}", response_model=IngredientResponse)
async def update_ingredient(id: int, ingredient_in: IngredientUpdate, db: SessionDep):
    result = await db.execute(select(Ingredient).where(Ingredient.id == id).options(selectinload(Ingredient.conversions)))
    db_obj = result.scalars().first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    update_data = ingredient_in.model_dump(exclude_unset=True)
    conversions_data = update_data.pop("conversions", None)
    
    price_changed = False
    if "package_cost" in update_data and update_data["package_cost"] != db_obj.package_cost:
        price_changed = True
    if "package_quantity" in update_data and update_data["package_quantity"] != db_obj.package_quantity:
        price_changed = True
        
    if price_changed:
        update_data["last_price_update"] = datetime.now(timezone.utc)
        
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    if conversions_data is not None:
        # Clear existing
        for c in list(db_obj.conversions):
            await db.delete(c)
        db_obj.conversions.clear()
        
        # Flush so SQLite deletes them before we insert new ones with same unit_name
        await db.flush()
        
        # Add new
        for conv in conversions_data:
            db_obj.conversions.append(IngredientConversion(**conv))
            
    try:
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Error de integridad (verifique que el nombre o la equivalencia no estén duplicados)")

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ingredient(id: int, db: SessionDep):
    db_obj = await db.get(Ingredient, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    try:
        await db.delete(db_obj)
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete ingredient.")

# Alias Endpoints

@router.get("/aliases", response_model=List[IngredientAliasResponse])
async def read_ingredient_aliases(db: SessionDep):
    result = await db.execute(select(IngredientAlias))
    return result.scalars().all()

@router.post("/aliases", response_model=IngredientAliasResponse, status_code=status.HTTP_201_CREATED)
async def create_ingredient_alias(alias_in: IngredientAliasCreate, db: SessionDep):
    normalized = normalize_text(alias_in.alias_name)
    if not normalized:
        raise HTTPException(status_code=400, detail="Nombre del alias no puede estar vacío")
        
    try:
        db_obj = IngredientAlias(
            ingredient_id=alias_in.ingredient_id,
            alias_name=alias_in.alias_name,
            normalized_alias=normalized
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Este alias ya está asociado a un ingrediente")

@router.delete("/aliases/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ingredient_alias(id: int, db: SessionDep):
    db_obj = await db.get(IngredientAlias, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Alias not found")
    try:
        await db.delete(db_obj)
        await db.commit()
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Cannot delete alias.")
