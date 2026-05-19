import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { useNavigate, Link } from 'react-router-dom';
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
    pickupPoint: 'м.Ужгород пл.Дружби народів',
    // Нові поля:
    receiverName: '',
    receiverPhone: '',
    deliveryDate: '',
    deliveryTime: '',
    paymentMethod: 'online' // online | postpaid
  });

  const [agreed, setAgreed] = useState(false);

  // Логіка підрахунку: товари + 200 грн (якщо доставка)
  const itemsTotal = items.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);
  const deliveryCost = customer.deliveryMethod === 'delivery' ? 200 : 0;
  const total = itemsTotal + deliveryCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return alert("Кошик порожній!");
    if (!agreed) return alert("Погодьтеся з умовами!");

    const orderData = {
      cart: items,
      customer: {
        ...customer,
        name: `${customer.firstName} ${customer.lastName}`
      },
      user_id: user?.id || null
    };

    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/checkout', orderData);
      
      if (res.data.success) {
        // Якщо вибрано післяплату — просто очищаємо кошик і кидаємо на статус успіху
        if (res.data.postpaid) {
          dispatch(clearCart());
          navigate(`/payment-status?orderReference=${res.data.orderReference}`);
          return;
        }

        // Якщо вибрано онлайн-оплату — формуємо форму для WayForPay
        const wfp = res.data.wfp;
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://secure.wayforpay.com/pay';

        const addInput = (name, value) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          input.value = value;
          form.appendChild(input);
        };

        Object.keys(wfp).forEach(key => {
          if (Array.isArray(wfp[key])) {
            wfp[key].forEach(val => addInput(key + '[]', val));
          } else {
            addInput(key, wfp[key]);
          }
        });

        document.body.appendChild(form);
        dispatch(clearCart());
        form.submit();
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
            <h3>Ваші контактні дані (Хто замовляє)</h3>
            <div className="form-row">
              <input placeholder="Ім'я" required value={customer.firstName} onChange={e => setCustomer({...customer, firstName: e.target.value})} />
              <input placeholder="Прізвище" required value={customer.lastName} onChange={e => setCustomer({...customer, lastName: e.target.value})} />
            </div>
            <div className="form-row">
              <input placeholder="Телефон" type="tel" required value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
              <input placeholder="Email" type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} />
            </div>
          </div>

          <div className="form-section">
            <h3>Спосіб отримання</h3>
            <div className="delivery-toggle">
              <label className={customer.deliveryMethod === 'delivery' ? 'active' : ''}>
                <input type="radio" checked={customer.deliveryMethod === 'delivery'} onChange={() => setCustomer({...customer, deliveryMethod: 'delivery'})} /> Доставка кур'єром (+200 грн)
              </label>
              <label className={customer.deliveryMethod === 'pickup' ? 'active' : ''}>
                <input type="radio" checked={customer.deliveryMethod === 'pickup'} onChange={() => setCustomer({...customer, deliveryMethod: 'pickup'})} /> Самовивіз (безкоштовно)
              </label>
            </div>

            {customer.deliveryMethod === 'delivery' ? (
              <div className="delivery-info">
                <input placeholder="Точна адреса доставки (Вулиця, будинок, квартира)..." required value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} style={{marginBottom: '15px'}} />
                
                <h4 style={{fontSize: '14px', marginBottom: '10px', color: '#c86b8e'}}>Коли доставити?</h4>
                <div className="form-row" style={{marginBottom: '15px'}}>
                  <input type="date" required value={customer.deliveryDate} onChange={e => setCustomer({...customer, deliveryDate: e.target.value})} />
                  <input type="time" required value={customer.deliveryTime} onChange={e => setCustomer({...customer, deliveryTime: e.target.value})} />
                </div>

                <h4 style={{fontSize: '14px', marginBottom: '10px', color: '#c86b8e'}}>Дані отримувача (Якщо отримуєте не ви)</h4>
                <div className="form-row">
                  <input placeholder="Ім'я отримувача" value={customer.receiverName} onChange={e => setCustomer({...customer, receiverName: e.target.value})} />
                  <input placeholder="Телефон отримувача" type="tel" value={customer.receiverPhone} onChange={e => setCustomer({...customer, receiverPhone: e.target.value})} />
                </div>
              </div>
            ) : (
              <div className="pickup-info">
                <p>Точка видачі:</p>
                <select value={customer.pickupPoint} onChange={e => setCustomer({...customer, pickupPoint: e.target.value})}>
                  <option value="м.Ужгород пл.Дружби народів">м.Ужгород пл.Дружби народів</option>
                  <option value="м.Ужгород пл. Корятовича, 33">м.Ужгород пл. Корятовича, 33</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Спосіб оплати</h3>
            <div className="delivery-toggle">
              <label className={customer.paymentMethod === 'online' ? 'active' : ''}>
                <input type="radio" checked={customer.paymentMethod === 'online'} onChange={() => setCustomer({...customer, paymentMethod: 'online'})} /> Оплата онлайн (Картка/ApplePay)
              </label>
              <label className={customer.paymentMethod === 'postpaid' ? 'active' : ''}>
                <input type="radio" checked={customer.paymentMethod === 'postpaid'} onChange={() => setCustomer({...customer, paymentMethod: 'postpaid'})} /> Оплата при отриманні
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Коментар</h3>
            <textarea placeholder="Ваші побажання до замовлення..." rows="3" value={customer.comment} onChange={e => setCustomer({...customer, comment: e.target.value})}></textarea>
          </div>

          <div style={{ margin: '20px 0', fontSize: '14px' }}>
            <label style={{ display: 'flex', gap: '10px', cursor: 'pointer', alignItems: 'center' }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} required style={{ width: 'auto', margin: 0 }} />
                <span>Я погоджуюсь з <Link to="/terms" target="_blank" style={{color: '#c86b8e'}}>умовами оферти</Link></span>
            </label>
          </div>
          
          <button type="submit" className="submit-order-btn">ПІДТВЕРДИТИ — {total} грн</button>
        </form>

        <div className="checkout-summary">
          <h3>Ваше замовлення</h3>
          <div className="summary-items">
            {items.map(item => (
              <div key={item.id} className="summary-item">
                <img src={item.img} alt={item.name} />
                <div className="summary-info">
                  <p>{item.name}</p>
                  <p>{item.qty} шт. x {item.price} грн</p>
                </div>
                <p>{item.qty * item.price} грн</p>
              </div>
            ))}
            {customer.deliveryMethod === 'delivery' && (
              <div className="summary-item" style={{ borderTop: '1px dashed #eee', paddingTop: '10px' }}>
                <div className="summary-info"><p>Доставка кур'єром</p></div>
                <p>200 грн</p>
              </div>
            )}
          </div>
          <div className="summary-total"><span>Разом:</span><span style={{color: '#c86b8e'}}>{total} грн</span></div>
        </div>
      </div>
    </div>
  );
}