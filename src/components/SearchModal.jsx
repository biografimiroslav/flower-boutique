import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchModal } from '../store/cartSlice';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/SearchModal.css';

export default function SearchModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector(state => state.cart.isSearchOpen);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  
  // Завантажуємо товари, коли модалка відкривається
  useEffect(() => {
    if (isOpen) {
      axios.get('http://localhost:5000/api/products')
        .then(res => setProducts(res.data))
        .catch(err => console.error(err));
      setQuery(''); // Очищаємо поле
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Фільтруємо "на льоту"
  const filtered = query.trim() === '' 
    ? [] 
    : products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  const close = () => dispatch(setSearchModal(false));

  return (
    <div className="modal show" onClick={(e) => e.target.className.includes('modal') && close()}>
      <div className="search-modal-content fade-in-up">
        <div className="search-header">
          <img src="/img/search.svg" alt="Search" className="search-icon-input" />
          <input 
            type="text" 
            placeholder="Який букет шукаєте?..." 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="close-search" onClick={close}>&times;</span>
        </div>
        
        <div className="search-results">
          {query && filtered.length === 0 && <p className="no-results">На жаль, нічого не знайдено 🌸</p>}
          {filtered.map(p => (
            <Link key={p.id} to={`/product?id=${p.id}`} className="search-item" onClick={close}>
              <img src={p.image_url} alt={p.name} />
              <div>
                <h4>{p.name}</h4>
                <p>{p.price} грн</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}