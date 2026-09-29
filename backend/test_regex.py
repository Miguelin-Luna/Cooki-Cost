import re

RECIPE_PATTERN = r"(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas)\s*(?:de|del)?\s*(.*)"
REVERSE_PATTERN = r"(.*?)\s*\(\s*(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas).*\)"
END_PATTERN = r"(.*?)\s+(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas)$"

line = "Nutella 10 cucharadas"

rev_match = re.search(REVERSE_PATTERN, line.lower())
if rev_match:
    print("REV", rev_match.groups())
else:
    end_match = re.search(END_PATTERN, line.lower())
    if end_match:
        print("END", end_match.groups())
    else:
        match = re.search(RECIPE_PATTERN, line.lower())
        if match:
            print("STD", match.groups())

line2 = "Huevo grande (1)"
rev_match2 = re.search(REVERSE_PATTERN, line2.lower())
if rev_match2:
    print("REV2", rev_match2.groups())
else:
    end_match2 = re.search(END_PATTERN, line2.lower())
    if end_match2:
        print("END2", end_match2.groups())
    else:
        match2 = re.search(RECIPE_PATTERN, line2.lower())
        if match2:
            print("STD2", match2.groups())
        else:
            print("NONE2")
