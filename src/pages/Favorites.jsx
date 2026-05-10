import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import PriceSlider from '../components/PriceSlider';
import '../styles/Catalog.css';

export default function Favorites() {
  const { favorites, token } = useSelector(state => state.auth);
  const [allProducts, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ cat: 'all', min: 0, max: 5000 });

  useEffect(() => {
    axios.get('http://localhost:5000/api/products').then(res => {
      const liked = res.data.filter(p => favorites.includes(p.id));
      setProducts(liked);
      setFiltered(liked);
    });
  }, [favorites]);

  useEffect(() => {
    let res = allProducts.filter(p => filters.cat === 'all' || p.category === filters.cat);
    res = res.filter(p => p.price >= filters.min && p.price <= filters.max);
    setFiltered(res);
  }, [filters, allProducts]);

  if (!token) return <div style={{padding:'100px', textAlign:'center'}}><h2>Увійдіть, щоб бачити обране 🌸</h2></div>;

  const cats = ['ТРОЯНДИ', 'ПРОПОЗИЦІЯ ТИЖНЯ', 'ПІОНОВИДНІ ТРОЯНДИ ТА ПІОНИ', 'МІКСОВАНІ БУКЕТИ', 'ТЮЛЬПАНИ', 'ГОРТЕНЗІЇ', 'ДОДАТКОВО ДО БУКЕТУ'];

  return (
    <div className="catalog-page-wrapper">
      <h1 className="catalogTex" style={{fontSize: '42px'}}>ВПОДОБАНІ ТОВАРИ</h1>
      
      <div className="catalogCatrgory" style={{marginBottom: '40px'}}>
        <ul className="catalogCategories">
          <li onClick={() => setFilters({...filters, cat: 'all'})} style={{color: filters.cat === 'all' ? '#c86b8e' : ''}}>ВСЕ</li>
          {cats.map(c => (
            <li key={c} onClick={() => setFilters({...filters, cat: c})} style={{color: filters.cat === c ? '#c86b8e' : ''}}>{c}</li>
          ))}
        </ul>
        <PriceSlider initialMin={filters.min} initialMax={filters.max} onEnter={(min, max) => setFilters({...filters, min, max})} />
      </div>

      <div id="catalogGrid">
        {filtered.length > 0 ? filtered.map(p => (
          <ProductCard key={p.id} product={p} />
        )) : <p style={{gridColumn:'1/-1', textAlign:'center', fontSize: '20px'}}>Нічого не знайдено за такими фільтрами 🌸</p>}
      </div>
    </div>
  );
}