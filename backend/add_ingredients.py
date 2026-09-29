import sqlite3
from datetime import datetime, timezone

ingredients = [
    ('Mantequilla sin sal', 'g', 113, 1.79),
    ('Azúcar blanca', 'g', 1000, 1.07),
    ('Azúcar morena', 'g', 1000, 2.07),
    ('Huevo grande', 'unidad', 30, 6.11),
    ('Esencia de vainilla', 'ml', 100, 1.07),
    ('Bicarbonato de sodio', 'g', 100, 0.51),
    ('Sal', 'g', 500, 0.53),
    ('Harina', 'g', 900, 1.92),
    ('Chispas de chocolate', 'g', 225, 6.11),
    ('Barras de kinder bueno', 'unidad', 3, 4.47),
    ('Nutella', 'g', 650, 13.94)
]

def add_ingredients():
    conn = sqlite3.connect('cookicost.db')
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    for name, unit, qty, cost in ingredients:
        try:
            cursor.execute('''INSERT INTO ingredients (name, unit, package_quantity, package_cost, created_at, last_price_update) VALUES (?, ?, ?, ?, ?, ?)''', (name, unit, qty, cost, now, now))
        except sqlite3.IntegrityError:
            pass
    conn.commit()
    conn.close()
    print('Ingredientes agregados!')
if __name__ == '__main__':
    add_ingredients()