import codecs

with codecs.open('app/api/v1/recipes.py', 'r', 'utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith("PAREN_PATTERN ="):
        new_lines.append('PAREN_PATTERN = r"(.*?)\\s*\\(\\s*(\\d+/?\\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas|ud|uds|gramo|gramos|mililitro|mililitros)"\n')
    elif line.startswith("PAREN_UNITLESS_PATTERN ="):
        new_lines.append('PAREN_UNITLESS_PATTERN = r"(.*?)\\s*\\(\\s*(\\d+/?\\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\\s*\\)"\n')
    elif line.startswith("END_PATTERN ="):
        new_lines.append('END_PATTERN = r"(.*?)\\s+(\\d+/?\\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas|ud|uds|gramo|gramos|mililitro|mililitros)\\s*$"\n')
    elif line.startswith("START_PATTERN ="):
        new_lines.append('START_PATTERN = r"^\\s*(\\d+/?\\d*|[½⅓¼⅕⅙⅛⅔¾⅖⅗⅘⅚⅜⅝⅞])\\s*(taza|tazas|cda|cdas|cucharada|cucharadas|cdta|cdtas|cucharadita|cucharaditas|g|kg|ml|l|oz|lb|unidad|unidades|funda|fundas|ud|uds|gramo|gramos|mililitro|mililitros)\\s*(?:de|del)?\\s*(.*)"\n')
    else:
        new_lines.append(line)

with codecs.open('app/api/v1/recipes.py', 'w', 'utf-8') as f:
    f.writelines(new_lines)