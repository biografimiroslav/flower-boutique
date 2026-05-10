import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart, setCartModal } from '../store/cartSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Checkout.css';

export default function Checkout() {
  const { items } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    comment: '',
    deliveryMethod: 'delivery', 
    pickupPoint: 'м.Ужгород пл.Дружби народів' // ОНОВЛЕНО АДРЕСУ ЗА ЗАМОВЧУВАННЯМ
  });

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return alert("Кошик порожній!");

    const orderData = {
      cart: items,
      customer: {
        ...customer,
        name: `${customer.firstName} ${customer.lastName}`,
        address: customer.deliveryMethod === 'pickup' ? `САМОВИВІЗ: ${customer.pickupPoint}` : customer.address
      },
      user_id: user?.id || null
    };

    try {
      const res = await axios.post('http://localhost:5000/api/checkout', orderData);
      if (res.data.success) {
        alert(`Замовлення №${res.data.order_id} прийнято! Менеджер зв'яжеться з вами для уточнення деталей та вартості доставки. 🌸`);
        dispatch(clearCart());
        navigate('/');
      }
    } catch (err) {
      alert("Помилка при оформленні. Спробуйте ще раз.");
    }
  };

  return (
    <div className="checkout-page fade-in-up">
      <h1>ОФОРМЛЕННЯ ЗАМОВЛЕННЯ</h1>
      
      <div className="checkout-container">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Контактні дані</h3>
            <div className="form-row">
              <input 
                placeholder="Ім'я" 
                required 
                value={customer.firstName}
                onChange={e => setCustomer({...customer, firstName: e.target.value})}
              />
              <input 
                placeholder="Прізвище" 
                required 
                value={customer.lastName}
                onChange={e => setCustomer({...customer, lastName: e.target.value})}
              />
            </div>
            <div className="form-row">
              <input 
                placeholder="Телефон" 
                type="tel" 
                required 
                value={customer.phone}
                onChange={e => setCustomer({...customer, phone: e.target.value})}
              />
              <input 
                placeholder="Email (необов'язково)" 
                type="email" 
                value={customer.email}
                onChange={e => setCustomer({...customer, email: e.target.value})}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Спосіб отримання</h3>
            <div className="delivery-toggle">
              <label className={customer.deliveryMethod === 'delivery' ? 'active' : ''}>
                <input 
                  type="radio" 
                  name="delivery" 
                  checked={customer.deliveryMethod === 'delivery'} 
                  onChange={() => setCustomer({...customer, deliveryMethod: 'delivery'})} 
                /> Доставка кур'єром
              </label>
              <label className={customer.deliveryMethod === 'pickup' ? 'active' : ''}>
                <input 
                  type="radio" 
                  name="delivery" 
                  checked={customer.deliveryMethod === 'pickup'} 
                  onChange={() => setCustomer({...customer, deliveryMethod: 'pickup'})} 
                /> Самовивіз
              </label>
            </div>

            {customer.deliveryMethod === 'delivery' ? (
              <div className="delivery-info">
                <input 
                  placeholder="Адреса доставки (вулиця, будинок, квартира)" 
                  required 
                  value={customer.address}
                  onChange={e => setCustomer({...customer, address: e.target.value})}
                />
                <div className="delivery-note">
                  <img src="/img/lineForLanguage.svg" alt="!" style={{height: '20px', marginRight: '10px'}} />
                  <p>Вартість доставки не входить у суму замовлення і обговорюється з менеджером індивідуально (залежить від району міста).</p>
                </div>
              </div>
            ) : (
              <div className="pickup-info">
                <p>Оберіть точку видачі:</p>
                <select 
                  value={customer.pickupPoint} 
                  onChange={e => setCustomer({...customer, pickupPoint: e.target.value})}
                >
                  {/* НОВІ АДРЕСИ ТУТ */}
                  <option value="м.Ужгород пл.Дружби народів">м.Ужгород пл.Дружби народів</option>
                  <option value="м.Ужгород пл. Корятовича, 33">м.Ужгород пл. Корятовича, 33</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Додатково</h3>
            <textarea 
              placeholder="Коментар до замовлення (текст для листівки, побажання тощо)" 
              rows="4"
              value={customer.comment}
              onChange={e => setCustomer({...customer, comment: e.target.value})}
            ></textarea>
          </div>

          <button type="submit" className="submit-order-btn">ПІДТВЕРДИТИ ЗАМОВЛЕННЯ — {total} грн</button>
        </form>

        <div className="checkout-summary">
          <h3>Ваш кошик</h3>
          <div className="summary-items">
            {items.map(item => (
              <div key={item.id} className="summary-item">
                <img src={item.img} alt={item.name} />
                <div className="summary-info">
                  <p className="summary-name">{item.name}</p>
                  <p className="summary-qty">{item.qty} шт. x {item.price} грн</p>
                </div>
                <p className="summary-subtotal">{item.qty * item.price} грн</p>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Разом:</span>
            <span>{total} грн</span>
          </div>
          <p className="manager-call-text">Після натискання кнопки підтвердження наш менеджер зв'яжеться з Вами для уточнення деталей оплати та доставки.</p>
        </div>
      </div>
    </div>
  );
}