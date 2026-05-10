from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import random
import smtplib
from email.mime.text import MIMEText
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token

app = Flask(__name__)

# Базовий CORS (дозволяємо все)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['JWT_SECRET_KEY'] = 'slavik-super-secret-key-2026'
jwt = JWTManager(app)

# ==========================================
# НАЛАШТУВАННЯ ПОШТИ
# ==========================================
SENDER_EMAIL = "flower.boutique.uzh@gmail.com" 
SENDER_PASSWORD = "onnxfahbilcplado" 

def send_email(to_email, subject, body):
    try:
        msg = MIMEText(body, 'html')
        msg['Subject'] = subject
        msg['From'] = f"Flower Boutique <{SENDER_EMAIL}>"
        msg['To'] = to_email

        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Помилка відправки листа: {e}")
        return False

# ==========================================
# ЗАЛІЗОБЕТОННИЙ ФІКС CORS (PREFLIGHT)
# ==========================================
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        res = jsonify()
        res.headers['Access-Control-Allow-Origin'] = '*'
        res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return res, 200

# ==========================================
# АВТОРИЗАЦІЯ ТА КОДИ (OTP)
# ==========================================
@app.route('/api/send-code', methods=['POST'])
def send_code():
    data = request.json
    email = data.get('email')
    action = data.get('action') 

    if not email:
        return jsonify({"error": "Вкажіть email"}), 400

    conn = sqlite3.connect('products.db')
    cursor = conn.cursor()

    if action == 'reset':
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"error": "Користувача з таким email не знайдено"}), 404

    code = str(random.randint(1000, 9999))
    
    cursor.execute('DELETE FROM otp_codes WHERE email = ?', (email,))
    cursor.execute('INSERT INTO otp_codes (email, code) VALUES (?, ?)', (email, code))
    conn.commit()
    conn.close()

    if action == 'reset':
        subject = "Відновлення пароля - Flower Boutique"
        body = f"<h3>Код для відновлення пароля:</h3><h1 style='color: #c86b8e;'>{code}</h1><p>Нікому не повідомляйте цей код.</p>"
    else:
        subject = "Код підтвердження - Flower Boutique"
        body = f"<h3>Ваш код підтвердження реєстрації:</h3><h1 style='color: #c86b8e;'>{code}</h1>"

    if send_email(email, subject, body):
        print(f"Код {code} відправлено на {email}") 
        return jsonify({"success": True, "message": "Код відправлено на пошту"})
    else:
        return jsonify({"error": "Помилка відправки листа."}), 500


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    code = data.get('code') 

    conn = sqlite3.connect('products.db')
    cursor = conn.cursor()

    cursor.execute('SELECT code FROM otp_codes WHERE email = ?', (email,))
    db_code = cursor.fetchone()

    if not db_code or db_code[0] != code:
        conn.close()
        return jsonify({"error": "Невірний або застарілий код"}), 400

    hashed_password = generate_password_hash(password)

    try:
        cursor.execute('''INSERT INTO users (name, email, phone, password_hash) 
                          VALUES (?, ?, ?, ?)''', (name, email, phone, hashed_password))
        
        cursor.execute('DELETE FROM otp_codes WHERE email = ?', (email,))
        conn.commit()
        user_id = cursor.lastrowid
        
        access_token = create_access_token(identity={'id': user_id, 'name': name, 'email': email})
        return jsonify({"success": True, "token": access_token, "user": {"id": user_id, "name": name, "email": email}})
    
    except sqlite3.IntegrityError:
        return jsonify({"error": "Користувач з таким email вже існує"}), 400
    finally:
        conn.close()


@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('new_password')

    conn = sqlite3.connect('products.db')
    cursor = conn.cursor()

    cursor.execute('SELECT code FROM otp_codes WHERE email = ?', (email,))
    db_code = cursor.fetchone()

    if not db_code or db_code[0] != code:
        conn.close()
        return jsonify({"error": "Невірний код підтвердження"}), 400

    hashed_password = generate_password_hash(new_password)
    
    cursor.execute('UPDATE users SET password_hash = ? WHERE email = ?', (hashed_password, email))
    cursor.execute('DELETE FROM otp_codes WHERE email = ?', (email,))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Пароль успішно змінено"})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = sqlite3.connect('products.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, password_hash FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user[3], password):
        access_token = create_access_token(identity={'id': user[0], 'name': user[1], 'email': user[2]})
        return jsonify({"success": True, "token": access_token, "user": {"id": user[0], "name": user[1], "email": user[2]}})
    else:
        return jsonify({"error": "Невірний email або пароль"}), 401

# ==========================================
# ТОВАРИ ТА ЗАМОВЛЕННЯ
# ==========================================
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
    return jsonify({"error": "Товар не знайдено"}), 404

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.json
    cart = data.get('cart', [])
    customer = data.get('customer', {})
    if not cart or not customer:
        return jsonify({'error': 'Порожні дані'}), 400
    total_price = sum(item['price'] * item['qty'] for item in cart)
    
    conn = sqlite3.connect('products.db')
    cursor = conn.cursor()
    date_now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('''INSERT INTO orders (name, phone, address, comment, total, date) VALUES (?, ?, ?, ?, ?, ?)''', 
                   (customer.get('name'), customer.get('phone'), customer.get('address'), customer.get('comment'), total_price, date_now))
    order_id = cursor.lastrowid
    for item in cart:
        cursor.execute('''INSERT INTO order_items (order_id, product_id, product_name, qty, price) VALUES (?, ?, ?, ?, ?)''', 
                       (order_id, item['id'], item['name'], item['qty'], item['price']))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'order_id': order_id})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)