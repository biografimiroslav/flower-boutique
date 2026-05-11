import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setAuth, setAuthModal, setAuthView, setTempData } from '../store/authSlice';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

export default function AuthModals() {
  const dispatch = useDispatch();
  const { isAuthModalOpen, authView, tempData } = useSelector(state => state.auth);
  
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', code: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  if (!isAuthModalOpen) return null;

  const close = () => {
    dispatch(setAuthModal(false));
    setError('');
    setForm({ name: '', email: '', phone: '', password: '', code: '' });
    setAgreed(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email: form.email, password: form.password });
      dispatch(setAuth({ token: res.data.token, user: res.data.user }));
      close();
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка входу');
    }
    setLoading(false);
  };

  const handleSendCode = async (e, actionType) => {
    e.preventDefault();
    if (actionType === 'register' && !agreed) {
        return setError('Потрібно погодитися з політикою');
    }
    setLoading(true); setError('');
    try {
      await axios.post('http://localhost:5000/api/send-code', { email: form.email, action: actionType });
      dispatch(setTempData({ ...form }));
      dispatch(setAuthView(actionType === 'register' ? 'register_code' : 'reset_code'));
      setForm({ ...form, code: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка відправки коду');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/register', { ...tempData, code: form.code });
      dispatch(setAuth({ token: res.data.token, user: res.data.user }));
      close();
    } catch (err) {
      setError(err.response?.data?.error || 'Невірний код');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axios.post('http://localhost:5000/api/reset-password', { email: tempData.email, code: form.code, new_password: form.password });
      alert('Пароль успішно змінено!');
      dispatch(setAuthView('login'));
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка скидання');
    }
    setLoading(false);
  };

  return (
    <div className="modal show" onClick={(e) => e.target.className.includes('modal') && close()}>
      <div className="modal-content auth-modal">
        <span className="close" onClick={close}>&times;</span>
        
        {authView === 'login' && (
          <form onSubmit={handleLogin}>
            <h2>Вхід в кабінет</h2>
            {error && <p className="auth-error">{error}</p>}
            <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
            <input name="password" type="password" placeholder="Пароль" required onChange={handleChange} />
            <button type="submit" disabled={loading}>{loading ? 'Зачекайте...' : 'УВІЙТИ'}</button>
            <p className="auth-links">
              <span onClick={() => dispatch(setAuthView('register'))}>Створити акаунт</span> | 
              <span onClick={() => dispatch(setAuthView('reset'))}>Забули пароль?</span>
            </p>
          </form>
        )}

        {authView === 'register' && (
          <form onSubmit={(e) => handleSendCode(e, 'register')}>
            <h2>Реєстрація</h2>
            {error && <p className="auth-error">{error}</p>}
            <input name="name" type="text" placeholder="Ваше ім'я" required onChange={handleChange} />
            <input name="email" type="email" placeholder="Email" required onChange={handleChange} />
            <input name="phone" type="tel" placeholder="Номер телефону" required onChange={handleChange} />
            <input name="password" type="password" placeholder="Придумайте пароль" required onChange={handleChange} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '13px' }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} required style={{width: 'auto'}} />
                <label>Я погоджуюсь з <Link to="/privacy" onClick={close} style={{color: '#c86b8e'}}>політикою конфіденційності</Link></label>
            </div>
            <button type="submit" disabled={loading}>{loading ? 'Відправка...' : 'ОТРИМАТИ КОД НА ПОШТУ'}</button>
            <p className="auth-links"><span onClick={() => dispatch(setAuthView('login'))}>Вже є акаунт? Увійти</span></p>
          </form>
        )}

        {authView === 'reset' && (
          <form onSubmit={(e) => handleSendCode(e, 'reset')}>
            <h2>Відновлення пароля</h2>
            {error && <p className="auth-error">{error}</p>}
            <input name="email" type="email" placeholder="Ваш Email" required onChange={handleChange} />
            <button type="submit" disabled={loading}>{loading ? 'Відправка...' : 'ОТРИМАТИ КОД'}</button>
            <p className="auth-links"><span onClick={() => dispatch(setAuthView('login'))}>Повернутися до входу</span></p>
          </form>
        )}

        {authView === 'register_code' && (
          <form onSubmit={handleRegister}>
            <h2>Підтвердження</h2>
            <p className="auth-desc">Ми відправили код на {tempData?.email}</p>
            {error && <p className="auth-error">{error}</p>}
            <input name="code" type="text" placeholder="Введіть 4-значний код" required onChange={handleChange} />
            <button type="submit" disabled={loading}>{loading ? 'Перевірка...' : 'ПІДТВЕРДИТИ'}</button>
          </form>
        )}

        {authView === 'reset_code' && (
          <form onSubmit={handleReset}>
            <h2>Новий пароль</h2>
            <p className="auth-desc">Код відправлено на {tempData?.email}</p>
            {error && <p className="auth-error">{error}</p>}
            <input name="code" type="text" placeholder="Введіть 4-значний код" required onChange={handleChange} />
            <input name="password" type="password" placeholder="Новий пароль" required onChange={handleChange} />
            <button type="submit" disabled={loading}>{loading ? 'Перевірка...' : 'ЗБЕРЕГТИ ПАРОЛЬ'}</button>
          </form>
        )}
      </div>
    </div>
  );
}