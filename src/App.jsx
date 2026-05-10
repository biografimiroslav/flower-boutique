import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Modals from './components/Modals';
import SearchModal from './components/SearchModal'; // ДОДАНО
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Product from './pages/Product';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import AuthModals from './components/AuthModals';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product" element={<Product />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
      <Footer />
      <Modals />
      <AuthModals />
      <SearchModal /> {/* ВІКНО ПОШУКУ */}
    </>
  );
}