from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import random
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import hmac
import time
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['JWT_SECRET_KEY'] = 'slavik-super-secret-key-2026-flower-boutique-pro'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

SENDER_EMAIL = "flower.boutique.uzh@gmail.com" 
SENDER_PASSWORD = "onnxfahbilcplado" 

# --- ОБРОБНИКИ ПОМИЛОК JWT ---
@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"!!! JWT ПОМИЛКА: {error}")
    return jsonify({"error": f"Invalid token: {error}"}), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    print(f"!!! JWT ВІДСУТНІЙ: {error}")
    return jsonify({"error": "Missing token"}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print(f"!!! JWT ПРОСТРОЧЕНИЙ !!!")
    return jsonify({"error": "Expired token"}), 401

# --- БД І ПОШТА ---
def get_db():
    conn = sqlite3.connect('/home/admin_flower/flower-boutique/src/products.db')
    conn.row_factory = sqlite3.Row
    return conn

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
        print(f"Email Error: {e}")
        return False

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        res = jsonify()
        res.headers['Access-Control-Allow-Origin'] = '*'
        res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return res, 200

# --- АВТОРИЗАЦІЯ ---
@app.route('/api/send-code', methods=['POST'])
def send_code():
    data = request.json
    email, action = data.get('email'), data.get('action')
    conn = get_db(); cursor = conn.cursor()
    if action == 'reset':
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if not cursor.fetchone(): return jsonify({"error": "Email ne znaydeno"}), 404
    code = str(random.randint(1000, 9999))
    cursor.execute('DELETE FROM otp_codes WHERE email = ?', (email,))
    cursor.execute('INSERT INTO otp_codes (email, code) VALUES (?, ?)', (email, code))
    conn.commit(); conn.close()
    if send_email(email, "Kod pidtverdzhennya", f"<h1>Vash kod: {code}</h1>"):
        return jsonify({"success": True})
    return jsonify({"error": "Pomylka poshty"}), 500

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('SELECT code FROM otp_codes WHERE email = ?', (data.get('email'),))
    db_code = cursor.fetchone()
    if not db_code or db_code[0] != data.get('code'): return jsonify({"error": "Kod nevirnyi"}), 400
    try:
        pw = generate_password_hash(data.get('password'))
        cursor.execute('INSERT INTO users (name, email, phone, password_hash) VALUES (?,?,?,?)', 
                       (data.get('name'), data.get('email'), data.get('phone'), pw))
        u_id = cursor.lastrowid
        conn.commit()
        # ТУТ ВИПРАВЛЕНО: ПЕРЕДАЄМО ТІЛЬКИ ID ЯК РЯДОК
        token = create_access_token(identity=str(u_id))
        return jsonify({"success": True, "token": token, "user": {"id": u_id, "name": data.get('name'), "email": data.get('email'), 'phone': data.get('phone')}})
    except: return jsonify({"error": "Email zaynyatiy"}), 400
    finally: conn.close()

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('new_password')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT code FROM otp_codes WHERE email = ?', (email,))
    db_code = cursor.fetchone()
    if not db_code or db_code[0] != code:
        conn.close()
        return jsonify({"error": "Nevirnyi kod"}), 400
    hashed_password = generate_password_hash(new_password)
    cursor.execute('UPDATE users SET password_hash = ? WHERE email = ?', (hashed_password, email))
    cursor.execute('DELETE FROM otp_codes WHERE email = ?', (email,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, phone, password_hash FROM users WHERE email = ?', (data.get('email'),))
    u = cursor.fetchone()
    conn.close()
    if u and check_password_hash(u['password_hash'], data.get('password')):
        user_data = {"id": u['id'], "name": u['name'], "email": u['email'], "phone": u['phone']}
        # ТУТ ВИПРАВЛЕНО: ПЕРЕДАЄМО ТІЛЬКИ ID ЯК РЯДОК
        token = create_access_token(identity=str(u['id']))
        return jsonify({"success": True, "token": token, "user": user_data})
    return jsonify({"error": "Dani nevirni"}), 401

# --- КОРИСТУВАЧ І УЛЮБЛЕНЕ ---
@app.route('/api/user/orders', methods=['GET'])
@jwt_required()
def get_user_orders():
    uid = get_jwt_identity() # ТУТ ВИПРАВЛЕНО
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', (uid,))
    orders = [dict(row) for row in cursor.fetchall()]
    for o in orders:
        cursor.execute('SELECT * FROM order_items WHERE order_id = ?', (o['id'],))
        o['items'] = [dict(item) for item in cursor.fetchall()]
    conn.close()
    return jsonify(orders)

@app.route('/api/user/update', methods=['POST'])
@jwt_required()
def update_profile():
    uid = get_jwt_identity() # ТУТ ВИПРАВЛЕНО
    data = request.json
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('UPDATE users SET name=?, phone=? WHERE id=?', (data['name'], data['phone'], uid))
    conn.commit(); conn.close()
    return jsonify({"success": True})

@app.route('/api/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    uid = get_jwt_identity() # ТУТ ВИПРАВЛЕНО
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('SELECT product_id FROM favorites WHERE user_id = ?', (uid,))
    favs = [row[0] for row in cursor.fetchall()]
    conn.close()
    return jsonify(favs)

@app.route('/api/favorites/toggle', methods=['POST'])
@jwt_required()
def toggle_favorite():
    uid = get_jwt_identity() # ТУТ ВИПРАВЛЕНО
    pid = request.json.get('product_id')
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('SELECT * FROM favorites WHERE user_id=? AND product_id=?', (uid, pid))
    if cursor.fetchone(): cursor.execute('DELETE FROM favorites WHERE user_id=? AND product_id=?', (uid, pid))
    else: cursor.execute('INSERT INTO favorites (user_id, product_id) VALUES (?,?)', (uid, pid))
    conn.commit(); conn.close()
    return jsonify({"success": True})

# --- ТОВАРИ ТА ЧЕКАУТ ---
@app.route('/api/products')
def get_products():
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('SELECT * FROM products')
    res = [dict(r) for r in cursor.fetchall()]
    conn.close(); return jsonify(res)

@app.route('/api/products/<int:pid>')
def get_product(pid):
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('SELECT * FROM products WHERE id=?', (pid,))
    r = cursor.fetchone(); conn.close()
    if r: return jsonify(dict(r))
    return jsonify({"error": "Tovar ne znaydeno"}), 404

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.json
    cust = data.get('customer')
    uid = data.get('user_id') 
    conn = get_db(); cursor = conn.cursor()
    
    # Використовуємо float для ціни, щоб 1 грн або 1.50 працювали коректно
    total_sum = sum(float(i['price']) * int(i['qty']) for i in data['cart'])
    total_str = str(int(total_sum)) # WFP любить цілі числа або формат 1.00

    cursor.execute('INSERT INTO orders (user_id, name, phone, email, address, comment, total, status, date) VALUES (?,?,?,?,?,?,?,?,?)',
                   (uid, cust['name'], cust['phone'], cust.get('email'), cust['address'], cust.get('comment'), 
                    total_sum, 'Ochikuye oplaty', datetime.now().strftime("%Y-%m-%d %H:%M")))
    oid = cursor.lastrowid
    for i in data['cart']: 
        cursor.execute('INSERT INTO order_items (order_id, product_id, product_name, qty, price) VALUES (?,?,?,?,?)', 
                       (oid, i['id'], i['name'], i['qty'], i['price']))
    conn.commit(); conn.close()

    merchant = "biografimiroslav_github_io1"
    secret = "22cbf04e64fdf2b1b4b6838668885c1ad5bbba91"
    ref = str(oid)
    date = str(int(time.time()))
    names = [i['name'] for i in data['cart']]
    counts = [str(i['qty']) for i in data['cart']]
    prices = [str(int(float(i['price']))) for i in data['cart']]

    # Важливо: serviceUrl - це куди WFP пришле підтвердження для відправки листа
    sign_str = ";".join([merchant, "flower-boutique.com.ua", ref, date, total_str, "UAH"] + names + counts + prices)
    sign = hmac.new(secret.encode('utf-8'), sign_str.encode('utf-8'), 'md5').hexdigest()

    return jsonify({
        "success": True, 
        "wfp": {
            "merchantAccount": merchant,
            "merchantDomainName": "flower-boutique.com.ua",
            "orderReference": ref,
            "orderDate": date,
            "amount": total_str,
            "currency": "UAH",
            "merchantSignature": sign,
            "productName": names,
            "productPrice": prices,
            "productCount": counts,
            "serviceUrl": "https://flower-boutique.com.ua/api/payment-callback",
            "returnUrl": "https://flower-boutique.com.ua/api/payment-redirect"
        }
    })


# НОВИЙ ЕНДПОІНТ ДЛЯ ПІДТВЕРДЖЕННЯ ТА ЛИСТА
@app.route('/api/payment-callback', methods=['POST'])
def payment_callback():
    data = json.loads(request.data)
    ref = data.get('orderReference')
    status = data.get('transactionStatus')
    
    if status == 'Approved':
        conn = get_db(); cursor = conn.cursor()
        cursor.execute('UPDATE orders SET status = "Oplacheno" WHERE id = ?', (ref,))
        
        # Беремо дані для листа
        cursor.execute('SELECT email, total FROM orders WHERE id = ?', (ref,))
        order = cursor.fetchone()
        cursor.execute('SELECT product_name, qty FROM order_items WHERE order_id = ?', (ref,))
        items = cursor.fetchall()
        conn.commit(); conn.close()

        if order and order['email']:
            items_text = "".join([f"<li>{i['product_name']} x {i['qty']}</li>" for i in items])
            body = f"""
            <h2>Дякуємо за замовлення №{ref}! 🌸</h2>
            <p>Ваше замовлення успішно оплачено.</p>
            <ul>{items_text}</ul>
            <p><b>Сума: {order['total']} грн</b></p>
            <p>Ми вже готуємо ваші квіти!</p>
            """
            send_email(order['email'], f"Замовлення №{ref} оплачено", body)

    # Відповідь для WayForPay (обов'язково)
    return jsonify({"orderReference": ref, "status": "accept", "time": int(time.time())})

from flask import redirect

@app.route('/api/payment-redirect', methods=['POST', 'GET'])
def payment_redirect():
    # WayForPay передає дані форми через POST
    order_ref = request.form.get('orderReference', '')
    if not order_ref:
        order_ref = request.args.get('orderReference', '')
        
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="refresh" content="0; url=/payment-status?orderReference={order_ref}" />
    </head>
    <body>
        <script>window.location.href = "/payment-status?orderReference={order_ref}";</script>
    </body>
    </html>
    """

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')