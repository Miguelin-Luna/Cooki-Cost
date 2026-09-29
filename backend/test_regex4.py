import re

PAREN_PATTERN = r"(.*?)\s*\(\s*(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas|ud|uds|gramo|gramos|mililitro|mililitros)"
PAREN_UNITLESS_PATTERN = r"(.*?)\s*\(\s*(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*\)"
END_PATTERN = r"(.*?)\s+(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas|ud|uds|gramo|gramos|mililitro|mililitros)\s*$"
START_PATTERN = r"^\s*(\d+/?\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas|ud|uds|gramo|gramos|mililitro|mililitros)\s*(?:de|del)?\s*(.*)"

def test_line(line):
    lower_line = line.lower()
    
    paren_match = re.search(PAREN_PATTERN, lower_line)
    if paren_match:
        return "PAREN", paren_match.groups()
        
    paren_unitless = re.search(PAREN_UNITLESS_PATTERN, lower_line)
    if paren_unitless:
        return "UNITLESS", paren_unitless.groups()
        
    end_match = re.search(END_PATTERN, lower_line)
    if end_match:
        return "END", end_match.groups()
        
    start_match = re.search(START_PATTERN, lower_line)
    if start_match:
        return "START", start_match.groups()
        
    return "NONE", None

print(test_line("Nutella 10 cucharadas"))