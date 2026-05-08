import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import authReducer from './authSlice'; // <--- ДОДАЙ ЦЕ

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer // <--- ДОДАЙ ЦЕ
  }
});