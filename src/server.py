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
import requests

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- ХАРДКОД КЛЮЧІВ ТА НАЛАШТУВАНЬ ---
app.config['JWT_SECRET_KEY'] = 'slavik-super-secret-key-2026-flower-boutique-pro'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

SENDER_EMAIL = "flower.boutique.uzh@gmail.com" 
SENDER_PASSWORD = "onnxfahbilcplado" 

TELEGRAM_TOKEN = "8864433260:AAGMioRN2LA4grA_2ztJllW5C1mnyPYDrxU"
ADMIN_CHAT_ID = "6895594698"

WFP_MERCHANT = "biografimiroslav_github_io1"
WFP_SECRET = "22cbf04e64fdf2b1b4b6838668885c1ad5bbba91"
DOMAIN_NAME = "flower-boutique.com.ua"
# -------------------------------------

def send_tg_admin(text):
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": ADMIN_CHAT_ID, "text": text, "parse_mode": "HTML"})
    except Exception as e: 
        print(f"Telegram Error: {e}")

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({"error": f"Invalid token: {error}"}), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({"error": "Missing token"}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Expired token"}), 401

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
        return False

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        res = jsonify()
        res.headers['Access-Control-Allow-Origin'] = '*'
        res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return res, 200

@app.route('/api/send-code', methods=['POST'])
def send_code():
    data = request.json
    email, action = data.get('email'), data.get('action')
    conn = get_db(); cursor = conn.cursor()
    if action == 'reset':
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if not cursor.fetchone(): return jsonify({"error": "Email не знайдено"}), 404
    code = str(random.randint(1000, 9999))
    cursor.execute('DELETE FROM otp_codes WHERE email = ?', (email,))
    cursor.execute('INSERT INTO otp_codes (email, code) VALUES (?, ?)', (email, code))
    conn.commit(); conn.close()
    if send_email(email, "Код підтвердження", f"<h1>Ваш код: {code}</h1>"):
        return jsonify({"success": True})
    return jsonify({"error": "Помилка пошти"}), 500

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('SELECT code FROM otp_codes WHERE email = ?', (data.get('email'),))
    db_code = cursor.fetchone()
    if not db_code or db_code[0] != data.get('code'): return jsonify({"error": "Код невірний"}), 400
    try:
        pw = generate_password_hash(data.get('password'))
        cursor.execute('INSERT INTO users (name, email, phone, password_hash) VALUES (?,?,?,?)', 
                       (data.get('name'), data.get('email'), data.get('phone'), pw))
        u_id = cursor.lastrowid
        conn.commit()
        token = create_access_token(identity=str(u_id))
        return jsonify({"success": True, "token": token, "user": {"id": u_id, "name": data.get('name'), "email": data.get('email'), 'phone': data.get('phone')}})
    except: return jsonify({"error": "Email вже зайнятий"}), 400
    finally: conn.close()

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('new_password')
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('SELECT code FROM otp_codes WHERE email = ?', (email,))
    db_code = cursor.fetchone()
    if not db_code or db_code[0] != code:
        conn.close()
        return jsonify({"error": "Невірний код"}), 400
    hashed_password = generate_password_hash(new_password)
    cursor.execute('UPDATE users SET password_hash = ? WHERE email = ?', (hashed_password, email))
    cursor.execute('DELETE FROM otp_codes WHERE email = ?', (email,))
    conn.commit(); conn.close()
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
        token = create_access_token(identity=str(u['id']))
        return jsonify({"success": True, "token": token, "user": user_data})
    return jsonify({"error": "Дані невірні"}), 401

@app.route('/api/user/orders', methods=['GET'])
@jwt_required()
def get_user_orders():
    uid = get_jwt_identity()
    conn = get_db(); cursor = conn.cursor()
    # Вибираємо тільки ті замовлення, які мають статус успішної оплати
    cursor.execute('SELECT * FROM orders WHERE user_id = ? AND status = "Oplacheno" ORDER BY id DESC', (uid,))
    orders = [dict(row) for row in cursor.fetchall()]
    for o in orders:
        cursor.execute('SELECT * FROM order_items WHERE order_id = ?', (o['id'],))
        o['items'] = [dict(item) for item in cursor.fetchall()]
    conn.close()
    return jsonify(orders)

@app.route('/api/user/update', methods=['POST'])
@jwt_required()
def update_profile():
    uid = get_jwt_identity()
    data = request.json
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('UPDATE users SET name=?, phone=? WHERE id=?', (data['name'], data['phone'], uid))
    conn.commit(); conn.close()
    return jsonify({"success": True})

@app.route('/api/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    uid = get_jwt_identity()
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('SELECT product_id FROM favorites WHERE user_id = ?', (uid,))
    favs = [row[0] for row in cursor.fetchall()]
    conn.close()
    return jsonify(favs)

@app.route('/api/favorites/toggle', methods=['POST'])
@jwt_required()
def toggle_favorite():
    uid = get_jwt_identity()
    pid = request.json.get('product_id')
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('SELECT * FROM favorites WHERE user_id=? AND product_id=?', (uid, pid))
    if cursor.fetchone(): cursor.execute('DELETE FROM favorites WHERE user_id=? AND product_id=?', (uid, pid))
    else: cursor.execute('INSERT INTO favorites (user_id, product_id) VALUES (?,?)', (uid, pid))
    conn.commit(); conn.close()
    return jsonify({"success": True})

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
    return jsonify({"error": "Товар не знайдено"}), 404

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.json
    cust = data.get('customer')
    uid = data.get('user_id')
    cart_items = data.get('cart', [])
    
    conn = get_db(); cursor = conn.cursor()
    
    total_sum = 0
    validated_items = []
    names = []
    counts = []
    prices = []
    
    for item in cart_items:
        cursor.execute('SELECT name, price FROM products WHERE id = ?', (item['id'],))
        db_prod = cursor.fetchone()
        if db_prod:
            real_price = int(db_prod['price'])
            qty = int(item['qty'])
            total_sum += real_price * qty
            
            validated_items.append({
                'id': item['id'],
                'name': db_prod['name'],
                'qty': qty,
                'price': real_price
            })
            names.append(db_prod['name'])
            counts.append(str(qty))
            prices.append(str(real_price))
            
    if not validated_items:
        conn.close()
        return jsonify({"error": "Кошик порожній або товари не знайдені"}), 400

    total_str = str(int(total_sum))

    cursor.execute('INSERT INTO orders (user_id, name, phone, email, address, comment, total, status, date) VALUES (?,?,?,?,?,?,?,?,?)',
                   (uid, cust['name'], cust['phone'], cust.get('email'), cust['address'], cust.get('comment'), 
                    total_sum, 'Ochikuye oplaty', datetime.now().strftime("%Y-%m-%d %H:%M")))
    oid = cursor.lastrowid
    
    for i in validated_items: 
        cursor.execute('INSERT INTO order_items (order_id, product_id, product_name, qty, price) VALUES (?,?,?,?,?)', 
                       (oid, i['id'], i['name'], i['qty'], i['price']))
    conn.commit(); conn.close()

    date = str(int(time.time()))
    ref = f"{oid}_{date}"

    sign_str = ";".join([WFP_MERCHANT, DOMAIN_NAME, ref, date, total_str, "UAH"] + names + counts + prices)
    sign = hmac.new(WFP_SECRET.encode('utf-8'), sign_str.encode('utf-8'), 'md5').hexdigest()

    return jsonify({
        "success": True, 
        "wfp": {
            "merchantAccount": WFP_MERCHANT,
            "merchantDomainName": DOMAIN_NAME,
            "orderReference": ref,
            "orderDate": date,
            "amount": total_str,
            "currency": "UAH",
            "merchantSignature": sign,
            "productName": names,
            "productPrice": prices,
            "productCount": counts,
            "serviceUrl": f"https://{DOMAIN_NAME}/api/payment-callback",
            "returnUrl": f"https://{DOMAIN_NAME}/api/payment-redirect"
        }
    })

@app.route('/api/payment-callback', methods=['POST'])
def payment_callback():
    data = request.get_json(force=True, silent=True)
    if not data:
        data = request.form.to_dict()
    if not data and request.data:
        try:
            data = json.loads(request.data.decode('utf-8'))
        except Exception:
            pass
            
    if not data:
        send_tg_admin("❌ WFP Callback: Порожні дані запиту")
        return jsonify({"error": "Empty payload"}), 400

    wfp_sign = data.get('merchantSignature', '')
    sign_fields = [
        str(data.get('merchantAccount', '')),
        str(data.get('orderReference', '')),
        str(data.get('amount', '')),
        str(data.get('currency', '')),
        str(data.get('authCode', '')),
        str(data.get('cardPan', '')),
        str(data.get('transactionStatus', '')),
        str(data.get('reasonCode', ''))
    ]
    sign_str = ";".join(sign_fields)
    expected_sign = hmac.new(WFP_SECRET.encode('utf-8'), sign_str.encode('utf-8'), 'md5').hexdigest()
    
    if wfp_sign != expected_sign:
        send_tg_admin(f"⚠️ <b>Незбіг підпису шлюзу:</b>\nОчікували: {expected_sign}\nОтримали: {wfp_sign}\nПараметри: {sign_str}")

    ref = data.get('orderReference', '')
    status = data.get('transactionStatus', '')
    
    try:
        raw_id = ref.split('_')[0] if '_' in ref else ref
        actual_oid = int(raw_id)
    except (ValueError, TypeError):
        send_tg_admin(f"❌ WFP Callback: Помилка визначення ID замовлення: {ref}")
        return jsonify({"error": "Invalid order reference format"}), 400
    
    conn = get_db(); cursor = conn.cursor()
    
    if status.lower() == 'approved':
        cursor.execute('SELECT status, email, total FROM orders WHERE id = ?', (actual_oid,))
        order = cursor.fetchone()
        
        if order and order['status'] != 'Oplacheno':
            cursor.execute('UPDATE orders SET status = "Oplacheno" WHERE id = ?', (actual_oid,))
            cursor.execute('SELECT product_name, qty FROM order_items WHERE order_id = ?', (actual_oid,))
            items = cursor.fetchall()
            conn.commit()

            if order['email']:
                items_text = "".join([f"<li>{i['product_name']} x {i['qty']}</li>" for i in items])
                body = f"""
                <h2>Дякуємо за замовлення №{actual_oid}! 🌸</h2>
                <p>Ваше замовлення успішно оплачено.</p>
                <ul>{items_text}</ul>
                <p><b>Сума: {order['total']} грн</b></p>
                <p>Ми вже готуємо ваші квіти!</p>
                """
                send_email(order['email'], f"Замовлення №{actual_oid} оплачено", body)
                
            msg = f"💰 <b>НОВА ОПЛАТА НА САЙТІ!</b>\nЗамовлення: #{actual_oid}\nСума: {order['total']} грн\nКлієнт: {order['email']}"
            send_tg_admin(msg)
    else:
        # ЗАПИСУЄМО БУДЬ-ЯКИЙ ІНШИЙ СТАТУС В БД (Declined, Відхилено і тд)
        cursor.execute('UPDATE orders SET status = ? WHERE id = ?', (status, actual_oid))
        conn.commit()
        send_tg_admin(f"ℹ️ Оплата відхилена. Замовлення: #{actual_oid}, Статус: {status}")

    conn.close()

    resp_time = int(time.time())
    resp_sign_str = f"{ref};accept;{resp_time}"
    resp_sign = hmac.new(WFP_SECRET.encode('utf-8'), resp_sign_str.encode('utf-8'), 'md5').hexdigest()

    return jsonify({
        "orderReference": ref, 
        "status": "accept", 
        "time": resp_time,
        "signature": resp_sign
    })

@app.route('/api/orders/status/<string:oid>', methods=['GET'])
def get_order_status(oid):
    try:
        raw_id = oid.split('_')[0] if '_' in oid else oid
        actual_oid = int(raw_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Невірний формат ID замовлення"}), 400

    conn = get_db(); cursor = conn.cursor()
    cursor.execute('SELECT status, total FROM orders WHERE id = ?', (actual_oid,))
    order = cursor.fetchone()
    conn.close()
    
    if order:
        return jsonify({"success": True, "status": order['status'], "total": order['total']})
    return jsonify({"error": "Замовлення не знайдено"}), 404

@app.route('/api/payment-redirect', methods=['POST', 'GET'])
def payment_redirect():
    order_ref = request.form.get('orderReference', '')
    if not order_ref: order_ref = request.args.get('orderReference', '')
    actual_oid = order_ref.split('_')[0] if '_' in order_ref else order_ref
    
    return f"""
    <html>
    <head><meta http-equiv="refresh" content="0; url=/payment-status?orderReference={actual_oid}" /></head>
    <body><script>window.location.href = "/payment-status?orderReference={actual_oid}";</script></body>
    </html>
    """

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')