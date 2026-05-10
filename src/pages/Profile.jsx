import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, setAuth } from '../store/authSlice';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import '../styles/Profile.css';

export default function Profile() {
  const { user, token, favorites } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'account', 'favs'
  const [orders, setOrders] = useState([]);
  const [favProducts, setFavProducts] = useState([]);
  const [formData, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });

  useEffect(() => {
    if (!token) return navigate('/');
    
    // Завантаження замовлень
    axios.get('http://localhost:5000/api/user/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setOrders(res.data));

    // Завантаження товарів для обраного
    axios.get('http://localhost:5000/api/products')
      .then(res => setFavProducts(res.data.filter(p => favorites.includes(p.id))));
  }, [token, favorites]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/user/update', formData, { headers: { Authorization: `Bearer ${token}` } });
    dispatch(setAuth({ token, user: { ...user, ...formData } }));
    alert("Дані оновлено!");
  };

  return (
    <div className="profile-page fade-in-up">
      <div className="profile-header">
        <h1>Привіт, {user?.name}!</h1>
        <button onClick={() => { dispatch(logout()); navigate('/'); }} className="logout-btn">Вийти</button>
      </div>

      <nav className="profile-nav">
        <div className={`profile-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>МОЇ ЗАМОВЛЕННЯ</div>
        <div className={`profile-nav-item ${activeTab === 'favs' ? 'active' : ''}`} onClick={() => setActiveTab('favs')}>ОБРАНЕ</div>
        <div className={`profile-nav-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>ПРОФІЛЬ</div>
      </nav>

      <div className="profile-content">
        {activeTab === 'orders' && (
          <div className="orders-list">
            {orders.length === 0 ? <p>У вас ще немає замовлень</p> : orders.map(o => (
              <div key={o.id} className="order-item">
                <div className="order-header"><span>№{o.id} від {o.date}</span><span>{o.total} грн</span></div>
                <div className="order-details">
                  {o.items.map(i => <p key={i.id}>{i.product_name} x{i.qty}</p>)}
                  <p style={{marginTop:'10px'}}><b>Адреса:</b> {o.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'favs' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {favProducts.map(p => <ProductCard key={p.id} product={p} />)}
            {favProducts.length === 0 && <p>Тут поки порожньо</p>}
          </div>
        )}

        {activeTab === 'account' && (
          <form className="account-form" onSubmit={handleUpdate}>
            <label>Ім'я</label>
            <input value={formData.name} onChange={e => setForm({...formData, name: e.target.value})} />
            <label>Телефон</label>
            <input value={formData.phone} onChange={e => setForm({...formData, phone: e.target.value})} />
            <label>Email (не можна змінити)</label>
            <input value={user?.email} disabled style={{background: '#f5f5f5'}} />
            <button type="submit" className="save-btn">ЗБЕРЕГТИ ЗМІНИ</button>
          </form>
        )}
      </div>
    </div>
  );
}