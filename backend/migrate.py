import sqlite3
def migrate_db():
    conn = sqlite3.connect('cookicost.db')
    cursor = conn.cursor()
    try:
        cursor.execute('ALTER TABLE recipes ADD COLUMN image_url VARCHAR(255)')
        conn.commit()
        print('? Columna image_url aadida con xito.')
    except sqlite3.OperationalError:
        print('?? La columna ya existe o la tabla no est lista.')
    finally:
        conn.close()
if __name__ == '__main__':
    migrate_db()
