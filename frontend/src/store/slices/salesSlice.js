// frontend/src/store/slices/salesSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sales: [],
  currentSale: null,
  isLoading: false,
  error: null,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setSales: (state, action) => {
      state.sales = action.payload;
    },
    setCurrentSale: (state, action) => {
      state.currentSale = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addSaleItem: (state, action) => {
      if (state.currentSale) {
        state.currentSale.items.push(action.payload);
      }
    },
    removeSaleItem: (state, action) => {
      if (state.currentSale) {
        state.currentSale.items = state.currentSale.items.filter(
          (item) => item.id !== action.payload
        );
      }
    },
  },
});

export const {
  setSales,
  setCurrentSale,
  setLoading,
  setError,
  addSaleItem,
  removeSaleItem,
} = salesSlice.actions;

export default salesSlice.reducer;
