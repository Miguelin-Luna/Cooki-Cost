import sqlite3

def migrate_db():
    conn = sqlite3.connect('cookicost.db')
    cursor = conn.cursor()
    try:
        cursor.execute('ALTER TABLE recipes ADD COLUMN category VARCHAR(50)')
        print('✅ Columna category aadida con xito.')
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute('ALTER TABLE recipes ADD COLUMN is_favorite BOOLEAN DEFAULT 0')
        print('✅ Columna is_favorite aadida con xito.')
    except sqlite3.OperationalError:
        pass
        
    conn.commit()
    conn.close()

if __name__ == '__main__':
    migrate_db()