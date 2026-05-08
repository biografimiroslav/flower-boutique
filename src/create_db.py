import sqlite3
import os

def init_db():
    # Підключаємось до бази (якщо її немає - вона створиться автоматично)
    conn = sqlite3.connect('products.db')
    cursor = conn.cursor()

    # 1. Створюємо таблицю товарів
    cursor.execute('DROP TABLE IF EXISTS products')
    cursor.execute('''
    CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL
    )
    ''')

    # 2. Створюємо таблиці для замовлень (orders та order_items)
    cursor.execute('DROP TABLE IF EXISTS orders')
    cursor.execute('''
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT, 
        phone TEXT, 
        address TEXT, 
        comment TEXT, 
        total INTEGER, 
        date TEXT
    )
    ''')

    cursor.execute('DROP TABLE IF EXISTS order_items')
    cursor.execute('''
    CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        order_id INTEGER, 
        product_id INTEGER, 
        product_name TEXT, 
        qty INTEGER, 
        price INTEGER
    )
    ''')

    # 3. Список всіх товарів
    products = [
        ('Півонія Pink Charm', 2000, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400', 'ПІОНОВИДНІ ТРОЯНДИ ТА ПІОНИ'),
        ('Троянда Red Velvet', 1800, 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400', 'ТРОЯНДИ'),
        ('Півонія Sarah Bernhardt', 2500, 'https://images.unsplash.com/photo-1584729099713-4e8f5-course?w=400', 'ПІОНОВИДНІ ТРОЯНДИ ТА ПІОНИ'),
        ('Гортензія Romance', 2200, 'https://images.unsplash.com/photo-1592853621834-9c5610e4dd94?w=400', 'ГОРТЕНЗІЇ'),
        ('Тюльпан Queen of Night', 1200, 'https://images.unsplash.com/photo-1589890787819-7034181eb3e3?w=400', 'ТЮЛЬПАНИ'),
        ('Троянда Lady Essex', 1900, 'https://images.unsplash.com/photo-1553565159-3397a7f52245?w=400', 'ТРОЯНДИ'),
        ('Евкаліпт Cinerea', 800, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', 'ДОДАТКОВО ДО БУКЕТУ'),
        ('Піоноподібна троянда', 2300, 'https://images.unsplash.com/photo-1558447538-5efa782a8fae?w=400', 'ПІОНОВИДНІ ТРОЯНДИ ТА ПІОНИ'),
        ('Мікс букети', 3000, 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=400', 'МІКСОВАНІ БУКЕТИ'),
        ('Гортензія Premium', 2800, 'https://images.unsplash.com/photo-1566472031773-6d1a768c056e?w=400', 'ГОРТЕНЗІЇ'),
        ('Тюльпан Mix', 1500, 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400', 'ТЮЛЬПАНИ'),
        ('Сукуленти', 600, 'https://images.unsplash.com/photo-1589657560268-3649f3415919?w=400', 'ДОДАТКОВО ДО БУКЕТУ'),
        ('Поліподиум', 900, 'https://images.unsplash.com/photo-1588880326452-2f9f6a0fbaf3?w=400', 'БУКЕТИ З НЕ ТРОЯНД'),
        ('Пропозиція тижня', 1600, 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400', 'ПРОПОЗИЦІЯ ТИЖНЯ')
    ]

    # Закидаємо товари в таблицю
    cursor.executemany('INSERT INTO products (name, price, image_url, category) VALUES (?, ?, ?, ?)', products)

    conn.commit()
    conn.close()
    
    print("✅ База даних products.db успішно згенерована!")

if __name__ == '__main__':
    init_db()