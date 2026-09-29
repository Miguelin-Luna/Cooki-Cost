import re
from app.api.v1.recipes import parse_fraction

RECIPE_PATTERN = r"(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas)\s*(?:de|del)?\s*(.*)"
REVERSE_PATTERN = r"(.*?)\s*\(\s*(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas).*\)"

line = "Nutella"
rev_match = re.search(REVERSE_PATTERN, line.lower())
if rev_match:
    print("REV", rev_match.groups())
else:
    match = re.search(RECIPE_PATTERN, line.lower())
    if match:
        print("NORM", match.groups())
    else:
        print("NONE")