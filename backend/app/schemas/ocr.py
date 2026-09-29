from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.ingredient import normalize_unit_name

class OCRRecipeIngredient(BaseModel):
    name: str = Field(description="El nombre del ingrediente detectado")
    quantity: Optional[float] = Field(None, description="La cantidad detectada")
    unit: Optional[str] = Field(None, description="La unidad detectada (ej. g, taza)")
    source_text: str = Field(description="El texto original completo detectado para este ingrediente")
    
class OCRRecipeData(BaseModel):
    recipe_name: Optional[str] = Field(None, description="El nombre de la receta, si fue detectado")
    recipe_yield: Optional[int] = Field(None, description="El rendimiento de la receta, si aparece explícitamente (ej: 12 galletas)")
    ingredients: List[OCRRecipeIngredient] = Field(description="La lista de ingredientes extraída de la foto")

class ParsedIngredientMatch(BaseModel):
    detected_name: str
    quantity: Optional[float]
    unit: Optional[str]
    source_text: str
    normalized_quantity: Optional[float]
    normalized_unit: Optional[str]
    
    ingredient_id: Optional[int] = None
    matched_name: Optional[str] = None
    match_confidence: float = 0.0
    needs_review: bool = True
    review_reason: Optional[str] = None

class ParsedRecipeDraftResponse(BaseModel):
    recipe_name: Optional[str]
    recipe_yield: Optional[int]
    ingredients: List[ParsedIngredientMatch]
