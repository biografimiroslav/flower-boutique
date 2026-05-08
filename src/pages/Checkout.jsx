import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clearCart } from '../store/cartSlice';
import '../styles/Checkout.css';

export default function Checkout() {
  const cart = useSelector(state => state.cart.items);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', address: '', comment: '' });
  const [loading, setLoading] = useState(false);

  if (cart.length === 0) return <div style={{ padding: '100px', textAlign: 'center' }}>Ваш кошик порожній.</div>;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post('http://localhost:5000/api/checkout', { customer: form, cart })
      .then(res => {
        dispatch(clearCart());
        alert(`Дякуємо, ${form.name}! Ваше замовлення #${res.data.order_id} успішно оформлено.`);
        navigate('/');
      })
      .catch(err => {
        alert("Помилка сервера.");
        setLoading(false);
      });
  };

  return (
    <main className="checkout-wrapper fade-in-up">
      <div className="checkout-form-container">
        <h1 className="checkout-title">Оформлення замовлення</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ваше ім'я *</label>
            <input type="text" required onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Номер телефону *</label>
            <input type="tel" required onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Адреса доставки *</label>
            <input type="text" required onChange={e => setForm({...form, address: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Коментар</label>
            <textarea rows="4" onChange={e => setForm({...form, comment: e.target.value})}></textarea>
          </div>
          <button type="submit" className="submit-order-btn" disabled={loading}>{loading ? 'ОБРОБКА...' : 'ПІДТВЕРДИТИ ЗАМОВЛЕННЯ'}</button>
        </form>
      </div>
      <div className="checkout-summary">
        <h2 className="checkout-title" style={{ fontSize: '22px' }}>Ваше замовлення</h2>
        {cart.map(item => (
          <div key={item.id} className="summary-item">
            <div className="summary-item-name">{item.name} <b>x{item.qty}</b></div>
            <div className="summary-item-price">{item.price * item.qty} грн</div>
          </div>
        ))}
        <div className="summary-total"><span>До сплати:</span><span>{total} грн</span></div>
      </div>
    </main>
  );
}