import { createSlice } from '@reduxjs/toolkit';

let initToken = localStorage.getItem('flower_token');
let initUserStr = localStorage.getItem('flower_user');
let initUser = null;

// ЗАХИСТ: Якщо токен поламаний (зберігся як текст "undefined" або "null") — стираємо все
if (!initToken || initToken === 'undefined' || initToken === 'null' || !initUserStr || initUserStr === 'undefined') {
    initToken = null;
    localStorage.removeItem('flower_token');
    localStorage.removeItem('flower_user');
} else {
    try {
        initUser = JSON.parse(initUserStr);
    } catch (e) {
        initToken = null;
        localStorage.removeItem('flower_token');
        localStorage.removeItem('flower_user');
    }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: initToken,
    user: initUser,
    favorites: [], // Зберігаємо ID лайкнутих товарів
    isAuthModalOpen: false,
    authView: 'login', 
    tempData: null 
  },
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('flower_token', action.payload.token);
      localStorage.setItem('flower_user', JSON.stringify(action.payload.user));
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.favorites = [];
      localStorage.removeItem('flower_token');
      localStorage.removeItem('flower_user');
    },
    setAuthModal: (state, action) => { state.isAuthModalOpen = action.payload; },
    setAuthView: (state, action) => { state.authView = action.payload; },
    setTempData: (state, action) => { state.tempData = action.payload; }
  }
});

export const { setAuth, logout, setFavorites, setAuthModal, setAuthView, setTempData } = authSlice.actions;
export default authSlice.reducer;