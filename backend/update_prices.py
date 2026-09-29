import sqlite3
import datetime

def update_prices():
    conn = sqlite3.connect('cookicost.db')
    cursor = conn.cursor()
    
    products = [
        ("Mantequilla sin sal", "MIRAFLORES", "g", 100, 1.79),
        ("Azúcar blanca", "SAN CARLOS", "g", 1000, 1.07),
        ("Azúcar morena", "SAN CARLOS", "g", 2000, 2.07),
        ("Harina", "YA", "g", 900, 1.92),
        ("Chispas de chocolate", "SICAO", "g", 500, 6.11),
        ("Huevo grande", "INDAVES", "unidad", 30, 6.67),
        ("Esencia de vainilla", "DOÑA PETRA", "ml", 100, 1.04),
        ("Barras de Kinder Bueno", "KINDER", "g", 129, 4.47),
        ("Nutella", "FERRERO", "g", 650, 13.94),
        ("Bicarbonato de sodio", "GENERICO", "g", 500, 1.50),
        ("Sal", "GENERICO", "g", 1000, 0.80)
    ]
    
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    for name, brand, unit, qty, price in products:
        cursor.execute("SELECT id FROM ingredients WHERE name = ?", (name,))
        row = cursor.fetchone()
        
        if row:
            cursor.execute("""
                UPDATE ingredients 
                SET brand = ?, unit = ?, package_quantity = ?, package_cost = ?, last_price_update = ?
                WHERE id = ?
            """, (brand, unit, qty, price, now, row[0]))
            print(f"✅ Updated {name}")
        else:
            cursor.execute("""
                INSERT INTO ingredients (name, brand, unit, package_quantity, package_cost, last_price_update, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (name, brand, unit, qty, price, now, now))
            print(f"✨ Inserted {name}")
            
    conn.commit()
    conn.close()

if __name__ == '__main__':
    update_prices()