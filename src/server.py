from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import random
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['JWT_SECRET_KEY'] = 'slavik-super-secret-key-2026'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

SENDER_EMAIL = "flower.boutique.uzh@gmail.com" 
SENDER_PASSWORD = "onnxfahbilcplado" 

def get_db():
    conn = sqlite3.connect('products.db')
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
    except Exception:
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
        token = create_access_token(identity={'id': u_id, 'name': data.get('name'), 'email': data.get('email'), 'phone': data.get('phone')})
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
        token = create_access_token(identity=user_data)
        return jsonify({"success": True, "token": token, "user": user_data})
    return jsonify({"error": "Dani nevirni"}), 401

@app.route('/api/user/orders', methods=['GET'])
@jwt_required()
def get_user_orders():
    uid = get_jwt_identity()['id']
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
    uid = get_jwt_identity()['id']
    data = request.json
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('UPDATE users SET name=?, phone=? WHERE id=?', (data['name'], data['phone'], uid))
    conn.commit(); conn.close()
    return jsonify({"success": True})

@app.route('/api/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    uid = get_jwt_identity()['id']
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('SELECT product_id FROM favorites WHERE user_id = ?', (uid,))
    favs = [row[0] for row in cursor.fetchall()]
    conn.close()
    return jsonify(favs)

@app.route('/api/favorites/toggle', methods=['POST'])
@jwt_required()
def toggle_favorite():
    uid = get_jwt_identity()['id']
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
    return jsonify({"error": "Tovar ne znaydeno"}), 404

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.json
    cust = data.get('customer')
    uid = data.get('user_id') 
    conn = get_db(); cursor = conn.cursor()
    cursor.execute('INSERT INTO orders (user_id, name, phone, email, address, comment, total, date) VALUES (?,?,?,?,?,?,?,?)',
                   (uid, cust['name'], cust['phone'], cust.get('email'), cust['address'], cust.get('comment'), 
                    sum(i['price']*i['qty'] for i in data['cart']), datetime.now().strftime("%Y-%m-%d %H:%M")))
    oid = cursor.lastrowid
    for i in data['cart']: cursor.execute('INSERT INTO order_items (order_id, product_id, product_name, qty, price) VALUES (?,?,?,?,?)', (oid, i['id'], i['name'], i['qty'], i['price']))
    conn.commit(); conn.close()
    return jsonify({"success": True, "order_id": oid})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')