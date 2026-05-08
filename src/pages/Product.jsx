import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import ProductCard from '../components/ProductCard';
import '../styles/Product.css'; // Переконайся, що імпорт стилів на місці

export default function Product() {
  const [params] = useSearchParams();
  const id = params.get('id');
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [addons, setAddons] = useState([]); // Стейт для доповнень
  const dispatch = useDispatch();

  useEffect(() => {
    if (id) {
      // 1. Беремо головний товар
      axios.get(`http://localhost:5000/api/products/${id}`)
        .then(res => { 
            setProduct(res.data); 
            document.title = `${res.data.name} - Flower Boutique`; 
        })
        .catch(err => console.error("Помилка завантаження товару:", err));
      
      // 2. Беремо всі товари, щоб розкидати їх на "Схожі" та "Доповнення"
      axios.get('http://localhost:5000/api/products')
        .then(res => {
            const allProducts = res.data;
            // Відфільтровуємо 5 схожих (крім поточного)
            setRelated(allProducts.filter(p => p.id !== parseInt(id)).slice(0, 5));
            // Відфільтровуємо товари ТІЛЬКИ з категорії "ДОДАТКОВО ДО БУКЕТУ"
            setAddons(allProducts.filter(p => p.category === 'ДОДАТКОВО ДО БУКЕТУ').slice(0, 10));
        })
        .catch(err => console.error("Помилка завантаження бази:", err));
    }
  }, [id]);

  if (!product) return <div style={{ padding: '100px', textAlign: 'center', color: '#c86b8e' }}>Завантаження...</div>;

  // Функція для додавання "додатку" в кошик по кліку
  const handleAddAddon = (addon) => {
    dispatch(addToCart({ 
        id: addon.id, 
        name: addon.name, 
        price: parseInt(addon.price), 
        img: addon.image_url 
    }));
  };

  return (
    <>
      <section className="product-page fade-in-up">
        <div className="product-image-container">
          <img className="product-main-img" src={product.image_url} alt={product.name} />
        </div>
        <div className="product-info-container">
          <div className="product-header-row">
            <h1 className="product-title">{product.name}</h1>
            <button className="product-like-btn">
               <img src="/img/likePink.svg" alt="Like" />
            </button>
          </div>

          {/* БЛОК "ДОДАТКОВО ДО БУКЕТУ" */}
          <p className="product-subtitle">Додатково до букета:</p>
          <ul className="addons-grid">
            {addons.map(addon => (
              <li 
                key={addon.id} 
                className="addon-item" 
                onClick={() => handleAddAddon(addon)} 
                title="Натисніть, щоб додати в кошик"
              >
                <img className="addon-img" src={addon.image_url} alt={addon.name} />
                <p className="addon-price">{addon.price} грн</p>
              </li>
            ))}
          </ul>

          <div className="product-action-row" style={{ marginTop: '30px' }}>
            <p className="product-final-price">{product.price} грн</p>
            <button 
                className="product-buy-btn" 
                onClick={() => dispatch(addToCart({ id: product.id, name: product.name, price: parseInt(product.price), img: product.image_url }))}
            >
              Додати в кошик <img src="/img/busketForButton.svg" alt="Кошик" />
            </button>
          </div>
        </div>
      </section>

      <section className="related-products fade-in-up">
        <h2 className="related-title">ВАМ ТАКОЖ МОЖЕ СПОДОБАТИСЬ</h2>
        <div className="related-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
          {related.map(p => (
            <div key={p.id} className="related-item">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}