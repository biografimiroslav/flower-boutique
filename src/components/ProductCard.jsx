import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { setFavorites, logout } from '../store/authSlice';
import axios from 'axios';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user, token, favorites } = useSelector(state => state.auth);
  const isLiked = favorites.includes(product.id);

  const toggleLike = async (e) => {
    e.preventDefault();
    if (!user || !token) {
        alert("Uviydit v akaunt");
        return;
    }
    
    try {
        await axios.post('http://localhost:5000/api/favorites/toggle', { product_id: product.id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const res = await axios.get('http://localhost:5000/api/favorites', { headers: { Authorization: `Bearer ${token}` } });
        dispatch(setFavorites(res.data));
    } catch (err) {
        if (err.response?.status === 422 || err.response?.status === 401) {
            alert("Sesiya zakinchylas. Uviydit znovu");
            dispatch(logout());
        } else {
            console.error("Pomylka:", err);
        }
    }
  };

  return (
    <div className="storeFrontListItem">
      <Link to={`/product?id=${product.id}`} style={{display:'contents'}}>
        <div className="imgWrapper"><img className="storeFrontListImg" src={product.image_url} alt={product.name} /></div>
        <h2 className="storeFrontListName">{product.name}</h2>
        <p className="storeFrontListPrice">{product.price} грн</p>
      </Link>
      <div style={{display:'flex', gap:'10px', width:'100%'}}>
        <button className="storeFrontListButton" onClick={() => dispatch(addToCart({id: product.id, name: product.name, price: product.price, img: product.image_url}))}>
          Додати <img src="/img/busketForButton.svg" alt="Кошик" />
        </button>
      </div>
    </div>
  );
}