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
  
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [favProducts, setFavProducts] = useState([]);
  const [formData, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });

  useEffect(() => {
    if (!token) return navigate('/');
    
    // Історія замовлень
    axios.get('/api/user/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));

    // Товари для вкладки "Обране"
    axios.get('/api/products')
      .then(res => setFavProducts(res.data.filter(p => favorites.includes(p.id))));
  }, [token, favorites, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/user/update', formData, { headers: { Authorization: `Bearer ${token}` } });
      dispatch(setAuth({ token, user: { ...user, ...formData } }));
      alert("Дані успішно оновлено! ✨");
    } catch (err) { alert("Помилка при оновленні."); }
  };

  return (
    <div className="profile-page fade-in-up">
      <div className="profile-header">
        <h1>Вітаємо, {user?.name}!</h1>
        <button onClick={() => { dispatch(logout()); navigate('/'); }} className="logout-btn">ВИЙТИ</button>
      </div>

      <nav className="profile-nav">
        <div className={`profile-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>ЗАМОВЛЕННЯ</div>
        <div className={`profile-nav-item ${activeTab === 'favs' ? 'active' : ''}`} onClick={() => setActiveTab('favs')}>ОБРАНЕ</div>
        <div className={`profile-nav-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>НАЛАШТУВАННЯ</div>
      </nav>

      <div className="profile-content">
        {activeTab === 'orders' && (
          <div className="orders-list">
            {orders.length === 0 ? <p>У вас ще немає замовлень 🌸</p> : orders.map(o => (
              <div key={o.id} className="order-item">
                <div className="order-header"><span>№{o.id} від {o.date}</span><span>{o.total} грн</span></div>
                <div className="order-details">
                  {o.items?.map(i => <p key={i.id}>{i.product_name} x{i.qty}</p>)}
                  <p style={{marginTop:'10px', color: '#4a4a4a'}}><b>Адреса:</b> {o.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'favs' && (
          <div className="favs-grid">
            {favProducts.map(p => <ProductCard key={p.id} product={p} />)}
            {favProducts.length === 0 && <p style={{textAlign:'center', width:'100%'}}>Тут поки порожньо</p>}
          </div>
        )}

        {activeTab === 'account' && (
          <form className="account-form" onSubmit={handleUpdate}>
            <div className="form-group">
                <label>Ваше ім'я</label>
                <input value={formData.name} onChange={e => setForm({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
                <label>Ваш телефон</label>
                <input value={formData.phone} onChange={e => setForm({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group">
                <label>Email (не можна змінити)</label>
                <input value={user?.email} disabled style={{background: '#f5f5f5', color: '#888'}} />
            </div>
            <button type="submit" className="save-btn">ЗБЕРЕГТИ ЗМІНИ</button>
          </form>
        )}
      </div>
    </div>
  );
}