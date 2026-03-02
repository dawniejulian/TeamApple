// frontend/src/store/slices/inventorySlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  inventory: [],
  isLoading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventory: (state, action) => {
      state.inventory = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setInventory, setLoading, setError } = inventorySlice.actions;
export default inventorySlice.reducer;
