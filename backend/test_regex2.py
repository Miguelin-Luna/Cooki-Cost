import re

line = "Huevo grande (1)"
match = re.search(r'(.*?)\s*\(\s*(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*\)', line)
if match:
    print(match.groups())

line2 = "Mantequilla sin sal (113 g / ½ taza)"
match2 = re.search(r'(.*?)\s*\(\s*(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas)', line2.lower())
if match2:
    print(match2.groups())