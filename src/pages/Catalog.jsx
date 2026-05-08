import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import PriceSlider from '../components/PriceSlider';
import '../styles/Catalog.css';

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [allProducts, setProducts] = useState([]);
  const [displayedCount, setDisplayedCount] = useState(12);
  const [isMobileCatsOpen, setMobileCatsOpen] = useState(false);

  const category = params.get('category') || 'all';
  const min = parseInt(params.get('min')) || 0;
  const max = parseInt(params.get('max')) || 5000;

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Pomylka:", err));
  }, []);

  const filtered = allProducts.filter(p => {
    const catMatch = category === 'all' || p.category.toUpperCase() === category.toUpperCase();
    const price = parseInt(p.price);
    return catMatch && price >= min && price <= max;
  });

  const visible = filtered.slice(0, displayedCount);
  const categoriesList = ['ТРОЯНДИ', 'ПРОПОЗИЦІЯ ТИЖНЯ', 'ПІОНОВИДНІ ТРОЯНДИ ТА ПІОНИ', 'МІКСОВАНІ БУКЕТИ', 'ТЮЛЬПАНИ', 'ГОРТЕНЗІЇ', 'БУКЕТИ З НЕ ТРОЯНД', 'ДОДАТКОВО ДО БУКЕТУ'];

  const setCategory = (cat) => {
    const val = category === cat ? 'all' : cat;
    setParams({ category: val, min, max });
    setDisplayedCount(12);
  };

  const handlePriceEnter = (nMin, nMax) => {
    setParams({ category, min: nMin, max: nMax });
    setDisplayedCount(12);
  };

  return (
    <>
      <section className="storefront-header fade-in-up">
        <h1 className="storefront-title">Каталог</h1>
        <div className="categories-panel">
          <button className="category-toggle-btn" onClick={() => setMobileCatsOpen(!isMobileCatsOpen)}>
            КАТЕГОРІЇ
          </button>
          <div className={`categories-dropdown ${isMobileCatsOpen ? 'is-active' : ''}`}>
            <ul className="categories-list">
              {categoriesList.map(c => <li key={c} style={{ color: category === c ? '#c86b8e' : '' }} onClick={() => setCategory(c)}>{c}</li>)}
            </ul>
            <PriceSlider initialMin={min} initialMax={max} onEnter={handlePriceEnter} />
          </div>
        </div>
      </section>

      <section className="catalog fade-in-up">
        <h2 className="catalogTex">КАТАЛОГ</h2>
        <div className="catalogCatrgory">
          <ul className="catalogCategories">
            {categoriesList.map(c => <li key={c} style={{ color: category === c ? '#c86b8e' : '' }} onClick={() => setCategory(c)}>{c}</li>)}
          </ul>
          <PriceSlider initialMin={min} initialMax={max} onEnter={handlePriceEnter} />
        </div>
      </section>

      <section className="catalog-page-wrapper">
        <div id="catalogGrid">
          {allProducts.length === 0 ? (
             <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#c86b8e', padding: '40px' }}>Завантаження...</div>
          ) : visible.length === 0 ? (
             <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#4a4a4a', padding: '40px' }}>Нічого не знайдено 🌸</div>
          ) : (
             visible.map(p => <ProductCard key={p.id} product={p} />)
          )}
        </div>
        {displayedCount < filtered.length && (
          <div className="moreContainer fade-in-up" style={{ display: 'flex' }}>
            <button className="downMore" onClick={() => setDisplayedCount(prev => prev + 12)}>ЗАВАНТАЖИТИ ЩЕ</button>
          </div>
        )}
      </section>
    </>
  );
}