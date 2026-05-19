import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCartModal, setContactModal, setMobileMenu, setSearchModal } from '../store/cartSlice';
import { setAuthModal, setAuthView } from '../store/authSlice';
import GoogleTranslate from './GoogleTranslate';
import { useState, useEffect } from 'react'; // Додали імпорт хуків React

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cartItems = useSelector(state => state.cart.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const user = useSelector(state => state.auth.user);

  // Додаємо стан для відстеження активної мови (за замовчуванням 'uk')
  const [currentLang, setCurrentLang] = useState('uk');

  // Перевіряємо кукі при завантаженні, щоб знати, чи була вже обрана англійська
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
    if (match && match[1] === 'en') {
      setCurrentLang('en');
    }
  }, []);

  const changeLanguage = (langCode) => {
    setCurrentLang(langCode); // Перекидаємо рожевий колір на натиснуту кнопку
    
    const selectField = document.querySelector('.goog-te-combo');
    if (selectField) {
      selectField.value = langCode;
      selectField.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      document.cookie = `googtrans=/uk/${langCode}; path=/`;
      window.location.reload();
    }
  };

  const handleUserClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/profile');
    } else {
      dispatch(setAuthView('login'));
      dispatch(setAuthModal(true));
    }
  };

  return (
    <header className="header">
      <img className="phoneitems" onClick={() => dispatch(setMobileMenu(true))} src="/img/burger.svg" alt="Menu" />
      <img className="phoneitems" src="/img/logoForPhoneHeader.svg" alt="Logo Phone" />
      <Link className="headerLogoA" to="/">
        <img className="headerLogo" src="/img/logo.svg" alt="Logo" />
      </Link>
      <nav className="navList">
        <NavLink className={({isActive}) => isActive ? "navListItem active" : "navListItem"} to="/">Головна</NavLink>
        <NavLink className={({isActive}) => isActive ? "navListItem active" : "navListItem"} to="/catalog">Каталог</NavLink>
        <a className="navListItem" href="/#Poslugi">Послуги</a>
        <a className="navListItem" href="/#About">Про нас</a>
        <a className="navListItem" href="#" onClick={(e) => { e.preventDefault(); dispatch(setContactModal(true)); }}>Контакти</a>
      </nav>
      <nav className="navList2">
        
        <GoogleTranslate />

        {/* Додали клас "notranslate", щоб Гугл не перекладав букви UA та ENG */}
        <ul className="chooseLanguage notranslate">
          <li>
            <a 
              className={currentLang === 'uk' ? 'active' : ''} 
              onClick={() => changeLanguage('uk')} 
              style={{ cursor: 'pointer' }}
            >
              UA
            </a>
          </li>
          <li><img src="/img/lineForLanguage.svg" alt="|" /></li>
          <li>
            <a 
              className={currentLang === 'en' ? 'active' : ''} 
              onClick={() => changeLanguage('en')} 
              style={{ cursor: 'pointer' }}
            >
              ENG
            </a>
          </li>
        </ul>
        
        <ul className="nav2">
          <a href="#" onClick={(e) => { e.preventDefault(); dispatch(setSearchModal(true)); }}>
            <img className="iconPhone" src="/img/search.svg" alt="Search" />
          </a>
          
          <a href="#" onClick={handleUserClick}>
            <img className="iconPhone" src="/img/login.svg" alt="Login" />
          </a>
          
          <Link to="/favorites">
            <img className="iconPhone" src="/img/like.svg" alt="Like" />
          </Link>
          
          <a href="#" style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => { e.preventDefault(); dispatch(setCartModal(true)); }}>
            <img className="iconPhone" src="/img/basket.svg" alt="Basket" />
            <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: '#c86b8e', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold', display: totalItems > 0 ? 'inline-block' : 'none' }}>{totalItems}</span>
          </a>
        </ul>
      </nav>
    </header>
  );
}