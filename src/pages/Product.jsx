import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { setFavorites, logout } from '../store/authSlice';
import ProductCard from '../components/ProductCard';
import '../styles/Product.css';

export default function Product() {
  const [params] = useSearchParams();
  const id = params.get('id');
  
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [addons, setAddons] = useState([]);
  const [isError, setIsError] = useState(false);
  
  const dispatch = useDispatch();
  const { user, token, favorites } = useSelector(state => state.auth);

  useEffect(() => {
    if (id) {
      setIsError(false);
      
      axios.get(`/api/products/${id}`)
        .then(res => { 
            setProduct(res.data); 
            document.title = `${res.data.name} - Flower Boutique`; 
        })
        .catch(err => {
            console.error("Pomylka zavantazhennya tovaru:", err);
            setIsError(true);
        });
      
      axios.get('/api/products')
        .then(res => {
            const allProducts = res.data;
            setRelated(allProducts.filter(p => p.id !== parseInt(id)).slice(0, 5));
            setAddons(allProducts.filter(p => p.category === 'ДОДАТКОВО ДО БУКЕТУ').slice(0, 10));
        })
        .catch(err => console.error("Pomylka zavantazhennya bazy:", err));
    }
  }, [id]);

  const toggleLike = async (e) => {
    e.preventDefault();
    if (!user || !token) {
        alert("Uviydit v akaunt");
        return;
    }
    
    try {
        await axios.post('/api/favorites/toggle', { product_id: product.id }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const res = await axios.get('/api/favorites', { headers: { Authorization: `Bearer ${token}` } });
        dispatch(setFavorites(res.data));
    } catch (err) {
        console.error("Pomylka:", err);
        if (err.response?.status === 422 || err.response?.status === 401) {
            alert("Sesiya zakinchylas. Uviydit znovu");
            dispatch(logout());
        }
    }
  };

  if (isError) {
      return (
          <div style={{ padding: '100px', textAlign: 'center' }}>
              <h2 style={{ color: '#4a4a4a', marginBottom: '20px' }}>TOVAR NE ZNAYDENO</h2>
              <Link to="/" style={{ color: '#c86b8e', fontWeight: 'bold', textDecoration: 'underline' }}>NA GOLOVNU</Link>
          </div>
      );
  }

  if (!product) return <div style={{ padding: '100px', textAlign: 'center', color: '#c86b8e' }}>ZAVANTAZHENNYA...</div>;

  const handleAddAddon = (addon) => {
    dispatch(addToCart({ 
        id: addon.id, 
        name: addon.name, 
        price: parseInt(addon.price), 
        img: addon.image_url 
    }));
  };

  const isLiked = favorites.includes(product.id);

  return (
    <>
      <section className="product-page fade-in-up">
        <div className="product-image-container">
          <img className="product-main-img" src={product.image_url} alt={product.name} />
        </div>
        <div className="product-info-container">
          <div className="product-header-row">
            <h1 className="product-title">{product.name}</h1>
            <button className="product-like-btn" onClick={toggleLike}>
               <img src={isLiked ? "/img/likePink.svg" : "/img/like.svg"} alt="Like" />
            </button>
          </div>

          <p className="product-subtitle">Додатково до букета:</p>
          <ul className="addons-grid">
            {addons.map(addon => (
              <li 
                key={addon.id} 
                className="addon-item" 
                onClick={() => handleAddAddon(addon)} 
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