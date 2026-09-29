import sys
sys.path.append('.')
from app.api.v1.recipes import RECIPE_PATTERN, REVERSE_PATTERN, parse_fraction
import re

line = 'Nutella'
raw_name = line.replace('•', '').replace('->', '').strip()
raw_name = re.sub(r'\$\d+(?:[.,]\d+)?', '', raw_name).strip()
print('raw_name:', raw_name)