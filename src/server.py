from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/api/products')
def get_products():
    conn = sqlite3.connect('products.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, price, image_url, category FROM products ORDER BY RANDOM()')
    products = cursor.fetchall()
    conn.close()
    return jsonify([{'id': row[0], 'name': row[1], 'price': row[2], 'image_url': row[3], 'category': row[4]} for row in products])

@app.route('/api/products/<int:product_id>')
def get_product(product_id):
    conn = sqlite3.connect('products.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, price, image_url, category FROM products WHERE id = ?', (product_id,))
    product = cursor.fetchone()
    conn.close()
    if product:
        return jsonify({'id': product[0], 'name': product[1], 'price': product[2], 'image_url': product[3], 'category': product[4]})
    return jsonify({"error": "Tovar ne znaydeno"}), 404

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.json
    cart = data.get('cart', [])
    customer = data.get('customer', {})
    if not cart or not customer:
        return jsonify({'error': 'Porozhni dani'}), 400
    total_price = sum(item['price'] * item['qty'] for item in cart)
    conn = sqlite3.connect('products.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, address TEXT, comment TEXT, total INTEGER, date TEXT)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER, product_id INTEGER, product_name TEXT, qty INTEGER, price INTEGER)''')
    date_now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('''INSERT INTO orders (name, phone, address, comment, total, date) VALUES (?, ?, ?, ?, ?, ?)''', (customer.get('name'), customer.get('phone'), customer.get('address'), customer.get('comment'), total_price, date_now))
    order_id = cursor.lastrowid
    for item in cart:
        cursor.execute('''INSERT INTO order_items (order_id, product_id, product_name, qty, price) VALUES (?, ?, ?, ?, ?)''', (order_id, item['id'], item['name'], item['qty'], item['price']))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'order_id': order_id})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)