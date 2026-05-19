import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import PriceSlider from '../components/PriceSlider';

export default function Home() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Pomylka:", err));
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const track = document.getElementById('storeFrontList');
      if (track) {
        track.scrollLeft = 0;
      }
    }
  }, [products]);

  const slideLeft = () => {
    const track = document.getElementById('storeFrontList');
    if (track) track.scrollBy({ left: -track.offsetWidth, behavior: 'smooth' });
  };

  const slideRight = () => {
    const track = document.getElementById('storeFrontList');
    if (track) track.scrollBy({ left: track.offsetWidth, behavior: 'smooth' });
  };

  const cats = [
    { name: 'ТРОЯНДИ', cl: 'rose' },
    { name: 'ПРОПОЗИЦІЯ ТИЖНЯ', cl: 'offer' },
    { name: 'ПІОНОПОДІБНІ ТРОЯНДИ ТА ПІОНИ', cl: 'peonies' },
    { name: 'МІКСОВАНІ БУКЕТИ', cl: 'mixed' },
    { name: 'ТЮЛЬПАНИ', cl: 'tulips' },
    { name: 'ГОРТЕНЗІЇ', cl: 'hydrangeas' },
    { name: 'БУКЕТИ З НЕ ТРОЯНД', cl: 'non-rose' },
    { name: 'ДОДАТКОВО ДО БУКЕТУ', cl: 'addition' }
  ];

  return (
    <>
      <section className="storeFront fade-in-up">
        <h1 className="storeFrontMainText">ОНЛАЙН ВІТРИНА</h1>
        <div className="slider-wrapper">
          <button className="sliderArrow" id="sliderLeft" onClick={slideLeft} style={{ display: products.length ? 'flex' : 'none' }}>‹</button>
          <div className="storeFrontList" id="storeFrontList">
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', width: '100%', color: '#c86b8e' }}>Завантаження...</div>
            ) : (
              products.map(p => <ProductCard key={p.id} product={p} />)
            )}
          </div>
          <button className="sliderArrow" id="sliderRight" onClick={slideRight} style={{ display: products.length ? 'flex' : 'none' }}>›</button>
        </div>
      </section>

      <section className="selectionByPrice fade-in-up">
        <h2 className="selectionByPriceTitle">ПІДБІР ЗА ЦІНОЮ</h2>
        <div className="selectionByPriceContainer">
          <PriceSlider />
          <div className="selectionByPriceButtons">
            <button className="selectionByPriceButton" onClick={() => navigate('/catalog?max=1000')}>ДО 1000</button>
            <button className="selectionByPriceButton" onClick={() => navigate('/catalog?min=1000&max=2000')}>1000-2000</button>
            <button className="selectionByPriceButton" onClick={() => navigate('/catalog?min=3000&max=4000')}>3000-4000</button>
            <button className="selectionByPriceButton" onClick={() => navigate('/catalog?min=4000')}>ВІД 4000</button>
          </div>
        </div>
      </section>

      <section id="Poslugi" className="categories fade-in-up">
        <div className="categoriesGrid">
          {cats.map(c => (
            <div key={c.name} className={`categoryItem ${c.cl}`} onClick={() => navigate(`/catalog?category=${encodeURIComponent(c.name)}`)} style={{ cursor: 'pointer' }}>
              <h3>{c.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section id="About" className="about fade-in-up">
        <h2 className="aboutTex">ПРО НАС</h2>
        <div className="aboutThing">
          <p className="aboutP"><span className="activeAbout">Flower Boutique</span> — це не просто квіткова крамниця, це простір, де народжується краса. 
    Ми створюємо унікальні квіткові композиції, що дарують емоції та зберігають найцінніші моменти. 
    Наша команда флористів вкладає душу в кожен букет, використовуючи лише найсвіжіші квіти, 
    щоб перетворити ваші почуття на справжнє мистецтво.</p>
          <div className="aboutImageWrapper"><img src="/img/about.png" alt="Про нас" /></div>
        </div>
      </section>
    </>
  );
}