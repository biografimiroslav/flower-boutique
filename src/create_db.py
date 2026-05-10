import sqlite3

def init_db():
    conn = sqlite3.connect('products.db')
    cursor = conn.cursor()

    # 1. Товари
    cursor.execute('DROP TABLE IF EXISTS products')
    cursor.execute('''CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL
    )''')

    # 2. Замовлення
    cursor.execute('DROP TABLE IF EXISTS orders')
    cursor.execute('''CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT, phone TEXT, address TEXT, comment TEXT, total INTEGER, date TEXT
    )''')

    cursor.execute('DROP TABLE IF EXISTS order_items')
    cursor.execute('''CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        order_id INTEGER, product_id INTEGER, product_name TEXT, qty INTEGER, price INTEGER
    )''')

    # 3. Користувачі
    cursor.execute('DROP TABLE IF EXISTS users')
    cursor.execute('''CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password_hash TEXT NOT NULL
    )''')

    # 4. Улюблене
    cursor.execute('DROP TABLE IF EXISTS favorites')
    cursor.execute('''CREATE TABLE favorites (
        user_id INTEGER,
        product_id INTEGER,
        UNIQUE(user_id, product_id)
    )''')

    # 5. ТИМЧАСОВІ КОДИ (OTP) - САМЕ ЦЬОГО БРАКУВАЛО
    cursor.execute('DROP TABLE IF EXISTS otp_codes')
    cursor.execute('''CREATE TABLE otp_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    # Початкові товари
    products = [
        ('Півонія Pink Charm', 2000, '/img/category3.png', 'ПІОНОВИДНІ ТРОЯНДИ ТА ПІОНИ'),
        ('Троянда Red Velvet', 1800, '/img/category1.png', 'ТРОЯНДИ'),
        ('Евкаліпт Cinerea', 800, '/img/category8.png', 'ДОДАТКОВО ДО БУКЕТУ'),
        ('Сукуленти', 600, '/img/category8.png', 'ДОДАТКОВО ДО БУКЕТУ'),
        ('Пропозиція тижня', 1600, '/img/category2.png', 'ПРОПОЗИЦІЯ ТИЖНЯ')
    ]
    cursor.executemany('INSERT INTO products (name, price, image_url, category) VALUES (?, ?, ?, ?)', products)

    conn.commit()
    conn.close()
    print("✅ База даних повністю оновлена!")

if __name__ == '__main__':
    init_db()