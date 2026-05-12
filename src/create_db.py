import sqlite3

def init_db():
    conn = sqlite3.connect('products.db')
    cursor = conn.cursor()

    cursor.execute('DROP TABLE IF EXISTS products')
    cursor.execute('''CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL
    )''')

    cursor.execute('DROP TABLE IF EXISTS orders')
    cursor.execute('''CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        user_id INTEGER,
        name TEXT, 
        phone TEXT, 
        email TEXT,
        address TEXT, 
        comment TEXT, 
        total INTEGER, 
        status TEXT DEFAULT 'Ochikuye oplaty',
        date TEXT
    )''')

    cursor.execute('DROP TABLE IF EXISTS order_items')
    cursor.execute('''CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        order_id INTEGER, 
        product_id INTEGER, 
        product_name TEXT, 
        qty INTEGER, 
        price INTEGER
    )''')

    cursor.execute('DROP TABLE IF EXISTS users')
    cursor.execute('''CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password_hash TEXT NOT NULL
    )''')

    cursor.execute('DROP TABLE IF EXISTS favorites')
    cursor.execute('''CREATE TABLE favorites (
        user_id INTEGER,
        product_id INTEGER,
        UNIQUE(user_id, product_id)
    )''')

    cursor.execute('DROP TABLE IF EXISTS otp_codes')
    cursor.execute('''CREATE TABLE otp_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')

    products = [
        ('Півонія Pink Charm', 2000, '/img/category3.png', 'ПІОНОВИДНІ ТРОЯНДИ ТА ПІОНИ'),
        ('Троянда Red Velvet', 1800, '/img/category1.png', 'ТРОЯНДИ'),
        ('Півонія Sarah Bernhardt', 2500, '/img/category3.png', 'ПІОНОВИДНІ ТРОЯНДИ ТА ПІОНИ'),
        ('Гортензія Romance', 2200, '/img/category6.png', 'ГОРТЕНЗІЇ'),
        ('Тюльпан Queen of Night', 1200, '/img/category5.png', 'ТЮЛЬПАНИ'),
        ('Троянда Lady Essex', 1900, '/img/category1.png', 'ТРОЯНДИ'),
        ('Евкаліпт Cinerea', 800, '/img/category8.png', 'ДОДАТКОВО ДО БУКЕТУ'),
        ('Піоноподібна троянда', 2300, '/img/category3.png', 'ПІОНОВИДНІ ТРОЯНДИ ТА ПІОНИ'),
        ('Мікс букети', 3000, '/img/category4.png', 'МІКСОВАНІ БУКЕТИ'),
        ('Гортензія Premium', 2800, '/img/category6.png', 'ГОРТЕНЗІЇ'),
        ('Тюльпан Mix', 1500, '/img/category5.png', 'ТЮЛЬПАНИ'),
        ('Сукуленти', 600, '/img/category8.png', 'ДОДАТКОВО ДО БУКЕТУ'),
        ('Поліподиум', 900, '/img/category7.png', 'БУКЕТИ З НЕ ТРОЯНД'),
        ('Пропозиція тижня', 1600, '/img/category2.png', 'ПРОПОЗИЦІЯ ТИЖНЯ')
    ]
    cursor.executemany('INSERT INTO products (name, price, image_url, category) VALUES (?, ?, ?, ?)', products)

    conn.commit()
    conn.close()
    print("Baza danykh onovlena")

if __name__ == '__main__':
    init_db()