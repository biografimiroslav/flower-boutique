import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAdd = (e) => {
    e.preventDefault();
    dispatch(addToCart({ id: product.id, name: product.name, price: parseInt(product.price), img: product.image_url }));
  };

  return (
    <div className="storeFrontListItem fade-in-up">
      <Link to={`/product?id=${product.id}`} style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}>
        <div className="imgWrapper">
          <img className="storeFrontListImg" src={product.image_url} alt={product.name} loading="lazy" />
        </div>
        <h2 className="storeFrontListName">{product.name}</h2>
        <p className="storeFrontListPrice">{product.price} грн</p>
      </Link>
      <button className="storeFrontListButton" onClick={handleAdd}>
        Додати <img src="/img/busketForButton.svg" alt="Кошик" />
      </button>
    </div>
  );
}