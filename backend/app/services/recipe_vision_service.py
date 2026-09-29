import os
import json
from abc import ABC, abstractmethod
from app.schemas.ocr import OCRRecipeData

class RecipeVisionService(ABC):
    @abstractmethod
    async def parse_recipe_image(self, image_bytes: bytes) -> OCRRecipeData:
        pass

class GeminiVisionService(RecipeVisionService):
    def __init__(self):
        from google import genai
        from dotenv import load_dotenv
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        self.client = genai.Client(api_key=api_key)

    async def parse_recipe_image(self, image_bytes: bytes) -> OCRRecipeData:
        from google.genai import types
        
        prompt = """
        Extrae los ingredientes y datos de esta foto de una receta.
        Devuelve ÚNICAMENTE un objeto JSON con esta estructura exacta, sin markdown ni backticks:
        {
          "recipe_name": "Nombre detectado o null",
          "recipe_yield": numero o null (ej: 12),
          "ingredients": [
            {
              "name": "Nombre del ingrediente",
              "quantity": numero_decimal_o_null,
              "unit": "Unidad (ej. g, taza) o null",
              "source_text": "Texto original tal cual aparece en la imagen para este ingrediente"
            }
          ]
        }
        Asegúrate de convertir las fracciones de la imagen (ej: ½, 1/2, 1 ½, ¼) a números decimales precisos en el campo 'quantity' (ej: 0.5, 1.5, 0.25).
        Si el texto dice "113 g mantequilla (1/2 taza)", escoge la medida principal (peso preferiblemente) para 'quantity' y 'unit' pero copia todo el texto en 'source_text'.
        No inventes el rendimiento (yield) si no aparece explícitamente.
        """
        
        response = self.client.models.generate_content(
            model='gemini-flash-latest',
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg'),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        try:
            data = json.loads(response.text)
            return OCRRecipeData(**data)
        except Exception as e:
            raise ValueError(f"Error parseando la respuesta de Gemini: {e}")

def get_vision_service() -> RecipeVisionService:
    return GeminiVisionService()
