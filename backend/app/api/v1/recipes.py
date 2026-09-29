from typing import List
from fastapi import APIRouter, HTTPException, status, UploadFile, File
import os
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.api.deps import SessionDep
from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient
from app.models.overhead import OverheadCost
from app.schemas.recipe import RecipeCreate, RecipeResponse, RecipeUpdate, SimulationResponse, ParseRequest, ParseResponse
from app.schemas.ingredient import IngredientResponse
from app.services.costing_service import calculate_simulation, get_overhead_total

router = APIRouter()

async def get_recipe_with_cost(db, recipe_id: int):
    result = await db.execute(
        select(Recipe)
        .options(
            selectinload(Recipe.ingredients)
            .joinedload(RecipeIngredient.ingredient)
            .selectinload(Ingredient.conversions)
        )
        .where(Recipe.id == recipe_id)
    )
    recipe = result.scalars().first()
    if not recipe:
        return None
    
    oh_result = await db.execute(select(OverheadCost))
    overheads = oh_result.scalars().all()
    
    from app.services.costing_service import calculate_ingredient_cost
    ingredients_cost = sum(calculate_ingredient_cost(ri.ingredient, ri.quantity, ri.unit)[0] for ri in recipe.ingredients)
    protection_cost = ingredients_cost * (recipe.protection_margin / 100)
    base_cost = ingredients_cost + protection_cost
    
    recipe.overhead_total = get_overhead_total(overheads, base_cost)
    return recipe

@router.get("/", response_model=List[RecipeResponse])
async def read_recipes(db: SessionDep):
    result = await db.execute(
        select(Recipe)
        .options(
            selectinload(Recipe.ingredients)
            .joinedload(RecipeIngredient.ingredient)
            .selectinload(Ingredient.conversions)
        )
    )
    recipes = result.scalars().all()
    
    oh_result = await db.execute(select(OverheadCost))
    overheads = oh_result.scalars().all()
    
    from app.services.costing_service import calculate_ingredient_cost
    for recipe in recipes:
        ingredients_cost = sum(calculate_ingredient_cost(ri.ingredient, ri.quantity, ri.unit)[0] for ri in recipe.ingredients)
        protection_cost = ingredients_cost * (recipe.protection_margin / 100)
        base_cost = ingredients_cost + protection_cost
        recipe.overhead_total = get_overhead_total(overheads, base_cost)
        
    return recipes

@router.post("/", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
async def create_recipe(recipe_in: RecipeCreate, db: SessionDep):
    recipe_data = recipe_in.model_dump(exclude={"ingredients"})
    db_obj = Recipe(**recipe_data)
    
    for ing_data in recipe_in.ingredients:
        db_obj.ingredients.append(RecipeIngredient(**ing_data.model_dump()))
        
    db.add(db_obj)
    await db.commit()
    return await get_recipe_with_cost(db, db_obj.id)

@router.get("/{id}", response_model=RecipeResponse)
async def read_recipe(id: int, db: SessionDep):
    recipe = await get_recipe_with_cost(db, id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.put("/{id}", response_model=RecipeResponse)
async def update_recipe(id: int, recipe_in: RecipeUpdate, db: SessionDep):
    result = await db.execute(
        select(Recipe).options(selectinload(Recipe.ingredients)).where(Recipe.id == id)
    )
    db_obj = result.scalars().first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    update_data = recipe_in.model_dump(exclude_unset=True)
    if "ingredients" in update_data:
        for old_ing in db_obj.ingredients:
            await db.delete(old_ing)
        db_obj.ingredients = []
        for ing_data in update_data.pop("ingredients"):
            db_obj.ingredients.append(RecipeIngredient(**ing_data))
            
    for field, value in update_data.items():
        setattr(db_obj, field, value)
        
    await db.commit()
    return await get_recipe_with_cost(db, db_obj.id)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(id: int, db: SessionDep):
    db_obj = await db.get(Recipe, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Recipe not found")
    await db.delete(db_obj)
    await db.commit()

@router.post("/{id}/duplicate", response_model=RecipeResponse)
async def duplicate_recipe(id: int, new_name: str, db: SessionDep):
    recipe = await get_recipe_with_cost(db, id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    db_obj = Recipe(
        name=new_name,
        yield_quantity=recipe.yield_quantity,
        yield_unit=recipe.yield_unit,
        protection_margin=recipe.protection_margin,
        profit_margin=recipe.profit_margin
    )
    
    for old_ing in recipe.ingredients:
        db_obj.ingredients.append(RecipeIngredient(
            ingredient_id=old_ing.ingredient.id,
            quantity=old_ing.quantity,
            unit=old_ing.unit
        ))
        
    db.add(db_obj)
    await db.commit()
    return await get_recipe_with_cost(db, db_obj.id)

@router.get("/{id}/simulate", response_model=SimulationResponse)
async def simulate_recipe(id: int, quantity: int, db: SessionDep):
    recipe = await get_recipe_with_cost(db, id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
        
    recipe_schema = RecipeResponse.model_validate(recipe)
    return calculate_simulation(recipe_schema.cost_per_unit, recipe_schema.suggested_price, quantity)

ALLOWED_EXTENSIONS = {"image/jpeg", "image/png", "image/webp"}

@router.post("/{id}/image", response_model=RecipeResponse)
async def upload_recipe_image(id: int, db: SessionDep, file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, detail="Solo se permiten imgenes (JPG, PNG, WEBP)")
    
    db_obj = await db.get(Recipe, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Recipe not found")

    ext = file.filename.split(".")[-1]
    filename = f"recipe_{id}.{ext}"
    filepath = os.path.join("uploads", "recipes", filename)
    
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    db_obj.image_url = f"/uploads/recipes/{filename}"
    db.add(db_obj)
    await db.commit()
    
    return await get_recipe_with_cost(db, id)

import re
from app.models.ingredient import Ingredient
import unicodedata

# 1. Matches: "Mantequilla sin sal (113 g / ½ taza)" -> "mantequilla sin sal", "113", "g"
PAREN_PATTERN = r"(.*?)\s*\(\s*(\d+/?\d*|[\u00BD\u2153\u00BC\u2155\u2159\u215B\u2154\u00BE\u2156\u2157\u2158\u215A\u215C\u215D\u215E])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas|ud|uds|gramo|gramos|mililitro|mililitros)"
# 2. Matches: "Huevo grande (1)" -> "huevo grande", "1"
PAREN_UNITLESS_PATTERN = r"(.*?)\s*\(\s*(\d+/?\d*|[\u00BD\u2153\u00BC\u2155\u2159\u215B\u2154\u00BE\u2156\u2157\u2158\u215A\u215C\u215D\u215E])\s*\)"
# 3. Matches: "Nutella 10 cucharadas" -> "nutella", "10", "cucharadas"
END_PATTERN = r"(.*?)\s+(\d+/?\d*|[\u00BD\u2153\u00BC\u2155\u2159\u215B\u2154\u00BE\u2156\u2157\u2158\u215A\u215C\u215D\u215E])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas|ud|uds|gramo|gramos|mililitro|mililitros)\s*$"
# 4. Matches: "10 cucharadas de Nutella" -> "10", "cucharadas", "nutella"
START_PATTERN = r"^\s*(\d+/?\d*|[\u00BD\u2153\u00BC\u2155\u2159\u215B\u2154\u00BE\u2156\u2157\u2158\u215A\u215C\u215D\u215E])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas|ud|uds|gramo|gramos|mililitro|mililitros)\s*(?:de|del)?\s*(.*)"

def parse_fraction(val: str) -> float:
    try:
        return float(eval(val))
    except:
        try:
            return unicodedata.numeric(val)
        except:
            return 0.0

def normalize_parsed_unit(unit_str: str) -> str:
    if not unit_str: return None
    u = unit_str.lower().strip()
    if u in ('unidad', 'unidades', 'ud', 'uds', 'pieza', 'piezas'): return 'unidad'
    if u in ('cucharada', 'cucharadas', 'cda', 'cdas', 'tbsp'): return 'cucharada'
    if u in ('cucharadita', 'cucharaditas', 'cdta', 'cdtas', 'tsp'): return 'cdta'
    if u in ('gramo', 'gramos', 'g'): return 'g'
    if u in ('kilogramo', 'kilogramos', 'kg'): return 'kg'
    if u in ('mililitro', 'mililitros', 'ml'): return 'ml'
    if u in ('litro', 'litros', 'l'): return 'l'
    if u in ('taza', 'tazas', 'cup', 'cups'): return 'taza'
    if u in ('funda', 'fundas'): return 'funda'
    return u

from app.models.ingredient import Ingredient
from app.models.ingredient_alias import IngredientAlias
from app.services.recipe_vision_service import get_vision_service
from app.schemas.ocr import ParsedRecipeDraftResponse, ParsedIngredientMatch
from thefuzz import fuzz
from app.core.utils import normalize_text

@router.post("/parse-image", response_model=ParsedRecipeDraftResponse)
async def parse_image_endpoint(db: SessionDep, file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, detail="Solo se permiten imágenes (JPG, PNG, WEBP)")
    
    # Optional: check file size (e.g. limit to 5MB)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(400, detail="La imagen supera el tamaño máximo permitido de 5MB")
        
    vision_service = get_vision_service()
    
    try:
        ocr_data = await vision_service.parse_recipe_image(content)
    except ValueError as e:
        raise HTTPException(500, detail=str(e))
        
    result = await db.execute(select(Ingredient))
    all_ingredients = result.scalars().all()
    
    alias_result = await db.execute(select(IngredientAlias))
    all_aliases = alias_result.scalars().all()
    
    parsed_ingredients = []
    
    for ing_data in ocr_data.ingredients:
        norm_qty = ing_data.quantity
        norm_unit = normalize_parsed_unit(ing_data.unit)
        
        best_match = None
        match_conf = 0.0
        review_reason = None
        needs_review = False
        
        raw_name_normalized = normalize_text(ing_data.name)
        
        # 1. Exact Match on Ingredient Name
        exact_ing = next((ing for ing in all_ingredients if normalize_text(ing.name) == raw_name_normalized), None)
        
        # 2. Exact Match on Alias
        exact_alias = None
        if not exact_ing:
            exact_alias = next((al for al in all_aliases if al.normalized_alias == raw_name_normalized), None)
            
        if exact_ing:
            best_match = exact_ing
            match_conf = 1.0
            needs_review = False
            review_reason = "exact_match"
        elif exact_alias:
            best_match = next((ing for ing in all_ingredients if ing.id == exact_alias.ingredient_id), None)
            match_conf = 1.0
            needs_review = False
            review_reason = "alias_match"
        else:
            # 3. Fuzzy Match
            matches = []
            for ing in all_ingredients:
                ing_norm = normalize_text(ing.name)
                score = fuzz.token_sort_ratio(raw_name_normalized, ing_norm)
                
                # Semantic collision checks
                collision = False
                semantic_pairs = [
                    ('sin sal', 'con sal'),
                    ('blanca', 'morena'),
                    ('impalpable', 'normal'),
                    ('entera', 'descremada'),
                    ('normal', 'integral'),
                    ('leche vegetal', 'leche'),
                    ('blanco', 'negro')
                ]
                
                # Check specific milk rule
                if 'leche vegetal' not in raw_name_normalized and 'leche vegetal' in ing_norm:
                    collision = True
                elif 'leche vegetal' in raw_name_normalized and 'leche vegetal' not in ing_norm and 'leche' in ing_norm:
                    collision = True
                
                for p1, p2 in semantic_pairs:
                    if (p1 in raw_name_normalized and p2 in ing_norm) or \
                       (p2 in raw_name_normalized and p1 in ing_norm) or \
                       (p1 in raw_name_normalized and p1 not in ing_norm) or \
                       (p1 not in raw_name_normalized and p1 in ing_norm):
                        # Only flag collision if it's a critical mismatch
                        if (p1 in raw_name_normalized and p2 in ing_norm) or (p2 in raw_name_normalized and p1 in ing_norm):
                            collision = True
                            break
                        # Handle impalpable vs normal/other
                        if p1 == 'impalpable' and ((p1 in raw_name_normalized and p1 not in ing_norm) or (p1 not in raw_name_normalized and p1 in ing_norm)):
                            collision = True
                            break
                            
                if collision:
                   continue # Skip semantically conflicting match
                   
                if score >= 60:
                    matches.append((ing, score))
                    
            if matches:
                # Sort by score descending
                matches.sort(key=lambda x: x[1], reverse=True)
                
                is_ambiguous = False
                if len(matches) > 1:
                    # If the top two scores are within 5 points, it's ambiguous
                    if matches[0][1] - matches[1][1] <= 5:
                        is_ambiguous = True
                        
                if is_ambiguous:
                    best_match = None
                    match_conf = 0.0
                    needs_review = True
                    review_reason = "ambiguous_match"
                else:
                    best_match = matches[0][0]
                    match_conf = matches[0][1] / 100.0
                    needs_review = True
                    review_reason = "fuzzy_match"
            else:
                best_match = None
                match_conf = 0.0
                needs_review = True
                review_reason = "no_match"
            
        parsed_ingredients.append(ParsedIngredientMatch(
            detected_name=ing_data.name,
            quantity=ing_data.quantity,
            unit=ing_data.unit,
            source_text=ing_data.source_text,
            normalized_quantity=norm_qty,
            normalized_unit=norm_unit,
            ingredient_id=best_match.id if best_match else None,
            matched_name=best_match.name if best_match else None,
            match_confidence=match_conf,
            needs_review=needs_review,
            review_reason=review_reason
        ))
        
    return ParsedRecipeDraftResponse(
        recipe_name=ocr_data.recipe_name,
        recipe_yield=ocr_data.recipe_yield,
        ingredients=parsed_ingredients
    )

@router.post("/parse", response_model=ParseResponse)
async def parse_recipe_text(request: ParseRequest, db: SessionDep):
    lines = request.text.split('\n')
    extracted = []
    
    result = await db.execute(select(Ingredient))
    all_ingredients = result.scalars().all()
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        qty_str = None
        unit = None
        raw_name = ""
        
        lower_line = line.lower()
        
        # 1. Paren pattern: Mantequilla (113 g ...)
        paren_match = re.search(PAREN_PATTERN, lower_line)
        if paren_match:
            raw_name, qty_str, unit = paren_match.groups()
        else:
            # 2. Paren unitless pattern: Huevo grande (1)
            paren_unitless = re.search(PAREN_UNITLESS_PATTERN, lower_line)
            if paren_unitless:
                raw_name, qty_str = paren_unitless.groups()
                unit = "unidad"
            else:
                # 3. End pattern: Nutella 10 cucharadas
                end_match = re.search(END_PATTERN, lower_line)
                if end_match:
                    raw_name, qty_str, unit = end_match.groups()
                else:
                    # 4. Start pattern: 113 g de mantequilla
                    start_match = re.search(START_PATTERN, lower_line)
                    if start_match:
                        qty_str, unit, raw_name = start_match.groups()
        
        if qty_str:
            raw_name = raw_name.replace('â€¢', '').replace('->', '').strip()
            qty = parse_fraction(qty_str)
            unit = normalize_parsed_unit(unit)
            status = "valid"
        else:
            raw_name = line.replace('â€¢', '').replace('->', '').strip()
            raw_name = re.sub(r'\$\d+(?:[.,]\d+)?', '', raw_name).strip()
            qty = None
            unit = None
            status = "missing_quantity"
            
        best_match = None
        
        # 1. Try exact match
        for ing in all_ingredients:
            if ing.name.lower() == raw_name:
                best_match = ing
                break
        
        # 2. Try exact word match
        if not best_match:
            for ing in all_ingredients:
                ing_lower = ing.name.lower()
                if re.search(r'\b' + re.escape(raw_name) + r'\b', ing_lower) or re.search(r'\b' + re.escape(ing_lower) + r'\b', raw_name):
                    best_match = ing
                    break
                    
        # 3. Fallback to substring match
        if not best_match:
            for ing in all_ingredients:
                ing_lower = ing.name.lower()
                if ing_lower in raw_name or raw_name in ing_lower:
                    best_match = ing
                    break
                    
        # Prevent duplicate ingredients in the parsed result
        if best_match:
            already_exists = any(item.get("ingredient_id") == best_match.id for item in extracted)
            if already_exists:
                continue
                
        final_unit = unit
        if not final_unit and best_match:
            final_unit = best_match.unit
            
        if not best_match and status == "valid":
            status = "missing_product"
            
        extracted.append({
            "raw_name": raw_name.capitalize(),
            "quantity": qty,
            "unit": final_unit,
            "ingredient_id": best_match.id if best_match else None,
            "ingredient_name": best_match.name if best_match else None,
            "status": status
        })
            
    return {"items": extracted}
