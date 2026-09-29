import re

raw_name = "huevo grande (1)"
ing_name = "huevo grande"

print("1. exact match:", ing_name == raw_name)
print("2. word match 1:", bool(re.search(r'\b' + re.escape(raw_name) + r'\b', ing_name)))
print("2. word match 2:", bool(re.search(r'\b' + re.escape(ing_name) + r'\b', raw_name)))
print("3. substring 1:", ing_name in raw_name)
print("3. substring 2:", raw_name in ing_name)