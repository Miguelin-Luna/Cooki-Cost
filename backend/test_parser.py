import sys
import os
sys.path.append('.')
import asyncio
from app.api.v1.recipes import parse_fraction
import re

RECIPE_PATTERN = r"(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas)\s*(?:de|del)?\s*(.*)"
REVERSE_PATTERN = r"(.*?)\s*\(\s*(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas).*\)"

text = '''• Mantequilla sin sal (113 g / ½ taza) -> ,79
• Azúcar blanca (67 g / ⅓ taza) -> ,07
• Azúcar morena (150 g / ½ taza) -> ,07
• Huevo grande (1) -> ,11
• Esencia de vainilla (1 cdta) -> ,07
• Bicarbonato de sodio (½ cdta) -> ,51
• Sal (¼ cdta) -> ,53
• Harina (186 g / 1½ taza) -> ,92
• Chispas de chocolate (225 g / 1½ taza) -> ,11
• Barras de Kinder Bueno (½ taza) -> ,47
• Nutella -> 10 cucharadas ,94'''

for line in text.split('\n'):
    line = line.strip().lower()
    rev_match = re.search(REVERSE_PATTERN, line)
    if rev_match:
        print('REV', rev_match.groups())
    else:
        match = re.search(RECIPE_PATTERN, line)
        if match:
            print('NORM', match.groups())
        else:
            print('NONE', line)
