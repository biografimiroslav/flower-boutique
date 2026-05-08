import { useSelector, useDispatch } from 'react-redux';
import { setCartModal, setContactModal, setMobileMenu, removeFromCart } from '../store/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Modals.css';

export default function Modals() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isCartOpen, isContactOpen, isMobileMenuOpen } = useSelector(state => state.cart);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const closeModals = () => {
    dispatch(setCartModal(false));
    dispatch(setContactModal(false));
  };

  return (
    <>
      <div className={`modal ${isContactOpen ? 'show' : ''}`} onClick={(e) => e.target.className.includes('modal') && closeModals()}>
        <div className="modal-content" style={{ maxWidth: '500px' }}>
          <span className="close" onClick={closeModals}>&times;</span>
          <div className="modal-phones">
            <h3>Наші контакти</h3>
            <p><a href="tel:+380667323331" style={{ color: 'inherit' }}>+38 (066) 732 3331</a></p>
            <p><a href="tel:+380987323331" style={{ color: 'inherit' }}>+38 (098) 732 3331</a></p>
            <p style={{ background: 'none', border: 'none', fontSize: '16px', color: '#4a4a4a', marginTop: '15px' }}>
              м.Ужгород, пл. Дружби народів<br />м.Ужгород, пл. Корятовича, 33
            </p>
          </div>
        </div>
      </div>

      <div className={`modal ${isCartOpen ? 'show' : ''}`} onClick={(e) => e.target.className.includes('modal') && closeModals()}>
        <div className="modal-content" style={{ maxWidth: '500px' }}>
          <span className="close" onClick={closeModals}>&times;</span>
          <h3 style={{ color: '#4A4A4A', fontSize: '24px', marginBottom: '20px', textAlign: 'center' }}>Ваш кошик</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
            {items.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#4a4a4a', margin: '20px 0' }}>Ваш кошик порожній 🌸</p>
            ) : (
              items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <img src={item.img} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ flexGrow: 1, padding: '0 10px' }}>
                    <h4 style={{ fontSize: '15px', color: '#4A4A4A', marginBottom: '5px' }}>{item.name}</h4>
                    <p style={{ fontSize: '14px', color: '#c86b8e' }}>{item.qty} шт x {item.price} грн = <b style={{ color: '#000' }}>{item.price * item.qty} грн</b></p>
                  </div>
                  <button onClick={() => dispatch(removeFromCart(item.id))} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#999', cursor: 'pointer' }}>✕</button>
                </div>
              ))
            )}
          </div>
          <div style={{ borderTop: '2px solid rgba(200, 107, 142, 0.2)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '18px', color: '#4a4a4a', fontWeight: '600' }}>Разом:</span>
            <span style={{ fontSize: '22px', color: '#000', fontWeight: '700' }}>{total} грн</span>
          </div>
          {items.length > 0 && (
            <button className="downMore" style={{ width: '100%', padding: '15px', margin: 0, background: '#c86b8e', color: 'white' }} onClick={() => { closeModals(); navigate('/checkout'); }}>
              ОФОРМИТИ ЗАМОВЛЕННЯ
            </button>
          )}
        </div>
      </div>

      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={(e) => e.target.className.includes('overlay') && dispatch(setMobileMenu(false))}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <img className="mobile-menu-logo" src="/img/logoForPhoneHeader.svg" alt="Logo" />
            <img className="mobile-menu-close" src="/img/хрестик.svg" alt="Close" onClick={() => dispatch(setMobileMenu(false))} />
          </div>
          <nav className="mobile-menu-nav">
            <Link to="/" onClick={() => dispatch(setMobileMenu(false))}>Головна</Link>
            <Link to="/catalog" onClick={() => dispatch(setMobileMenu(false))}>Каталог</Link>
            <a href="/#Poslugi" onClick={() => dispatch(setMobileMenu(false))}>Послуги</a>
            <a href="/#About" onClick={() => dispatch(setMobileMenu(false))}>Про нас</a>
            <a href="#" onClick={(e) => { e.preventDefault(); dispatch(setMobileMenu(false)); dispatch(setContactModal(true)); }}>Контакти</a>
          </nav>
        </div>
      </div>
    </>
  );
}