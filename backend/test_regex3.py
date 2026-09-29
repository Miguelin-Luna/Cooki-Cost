import re

PAREN_PATTERN = r"(.*?)\s*\(\s*(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas|ud|uds|gramo|gramos|mililitro|mililitros)"
PAREN_UNITLESS_PATTERN = r"(.*?)\s*\(\s*(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*\)"
END_PATTERN = r"(.*?)\s+(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas|ud|uds|gramo|gramos|mililitro|mililitros)\s*$"
START_PATTERN = r"^\s*(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas|ud|uds|gramo|gramos|mililitro|mililitros)\s*(?:de|del)?\s*(.*)"

def test_line(line):
    lower_line = line.lower()
    m1 = re.search(PAREN_PATTERN, lower_line)
    if m1: return "PAREN_PATTERN", m1.groups()
    m2 = re.search(PAREN_UNITLESS_PATTERN, lower_line)
    if m2: return "PAREN_UNITLESS_PATTERN", m2.groups()
    m3 = re.search(END_PATTERN, lower_line)
    if m3: return "END_PATTERN", m3.groups()
    m4 = re.search(START_PATTERN, lower_line)
    if m4: return "START_PATTERN", m4.groups()
    return "NONE", None

print(test_line("Huevo grande (1)"))
print(test_line("Nutella 10 cucharadas"))