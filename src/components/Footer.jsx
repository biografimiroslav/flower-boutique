import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setContactModal } from '../store/cartSlice';

export default function Footer() {
  const dispatch = useDispatch();

  return (
    <footer className="footer">
      <Link to="/" className="footerLogoA">
        <img className="footerLogo" src="/img/logoFooter.svg" alt="Логотип" />
      </Link>
      <ul className="footerNav">
        <li className="footerNavItem">
          <div>
            <ul className="footerMenu">
              <li><p className="footerMenuBigText" style={{ marginBottom: '5px' }}>МЕНЮ</p></li>
              <li><Link className="footerMenuSmallText" to="/">Головна</Link></li>
              <li><Link className="footerMenuSmallText" to="/catalog">Каталог</Link></li>
              <li><a className="footerMenuSmallText" href="/#Poslugi">Послуги</a></li>
              <li><a className="footerMenuSmallText" href="/#About">Про нас</a></li>
              <li><a className="footerMenuSmallText" href="#" onClick={(e) => { e.preventDefault(); dispatch(setContactModal(true)); }}>Контакти</a></li>
            </ul>
          </div>
        </li>
        <li className="footerNavItem">
          <ul className="footerMenu">
            <li><p className="footerMenuBigText" style={{ marginBottom: '5px' }}>ДОДАТКОВО</p></li>
            {/* ТУТ ТВОЇ НОВІ ПОСИЛАННЯ */}
            <li><Link className="footerMenuSmallText" to="/privacy">Політика конфіденційності</Link></li>
            <li><Link className="footerMenuSmallText" to="/terms">Умови використання</Link></li>
            <li><Link className="footerMenuSmallText" to="/refund">Повернення коштів</Link></li>
            <li><Link className="footerMenuSmallText" to="/contacts">Контактна інформація</Link></li>
            <li><img className="paySystemsImg" style={{ marginTop: '10px' }} src="/img/paySystems.svg" alt="Платіжні системи" /></li>
          </ul>
        </li>
        <li className="footerNavItem">
          <ul className="footerMenu">
            <li><p className="footerMenuBigText" style={{ marginBottom: '5px' }}>КОНТАКТИ</p></li>
            <li><a className="footerMenuSmallText" href="tel:+380667323331">+38 (066) 732 3331</a></li>
            <li><a className="footerMenuSmallText" href="tel:+380987323331">+38 (098) 732 3331</a></li>
            <li><a className="footerMenuSmallText" href="#">м.Ужгород пл.Дружби народів</a></li>
            <li><a className="footerMenuSmallText" href="#">м.Ужгород пл. Корятовича, 33</a></li>
          </ul>
        </li>
      </ul>
    </footer>
  );
}