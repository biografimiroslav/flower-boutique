import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('flower_token') || null,
    user: JSON.parse(localStorage.getItem('flower_user')) || null,
    isAuthModalOpen: false,
    authView: 'login', // 'login', 'register', 'register_code', 'reset', 'reset_code'
    tempData: null // Тимчасові дані для передачі між вікнами
  },
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('flower_token', action.payload.token);
      localStorage.setItem('flower_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('flower_token');
      localStorage.removeItem('flower_user');
    },
    setAuthModal: (state, action) => { state.isAuthModalOpen = action.payload; },
    setAuthView: (state, action) => { state.authView = action.payload; },
    setTempData: (state, action) => { state.tempData = action.payload; }
  }
});

export const { setAuth, logout, setAuthModal, setAuthView, setTempData } = authSlice.actions;
export default authSlice.reducer;