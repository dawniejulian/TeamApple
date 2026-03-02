// frontend/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import inventoryReducer from './slices/inventorySlice';
import salesReducer from './slices/salesSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    inventory: inventoryReducer,
    sales: salesReducer,
  },
});
