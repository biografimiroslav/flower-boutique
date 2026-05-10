import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: JSON.parse(localStorage.getItem('flower_cart')) || [],
    isCartOpen: false,
    isContactOpen: false,
    isMobileMenuOpen: false,
    isSearchOpen: false // ДОДАНО СТАН ПОШУКУ
  },
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) existing.qty += 1;
      else state.items.push({ ...action.payload, qty: 1 });
      localStorage.setItem('flower_cart', JSON.stringify(state.items));
      alert(`"${action.payload.name}" додано в кошик! 🌸`);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
      localStorage.setItem('flower_cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('flower_cart');
    },
    setCartModal: (state, action) => { state.isCartOpen = action.payload; },
    setContactModal: (state, action) => { state.isContactOpen = action.payload; },
    setMobileMenu: (state, action) => { state.isMobileMenuOpen = action.payload; },
    setSearchModal: (state, action) => { state.isSearchOpen = action.payload; } // ДОДАНО
  }
});

export const { addToCart, removeFromCart, clearCart, setCartModal, setContactModal, setMobileMenu, setSearchModal } = cartSlice.actions;
export default cartSlice.reducer;