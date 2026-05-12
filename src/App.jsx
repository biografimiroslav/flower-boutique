import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Modals from './components/Modals';
import SearchModal from './components/SearchModal';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Product from './pages/Product';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import AuthModals from './components/AuthModals';
import PaymentStatus from './pages/PaymentStatus'; 
import { PrivacyPolicy, Terms, RefundPolicy, Contacts } from './pages/Legal';

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
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
      </Routes>
      <Footer />
      <Modals />
      <AuthModals />
      <SearchModal />
    </>
  );
}