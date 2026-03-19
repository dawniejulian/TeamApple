// frontend/src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async: load current user from /auth/me
export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return response.data.data;
  } catch (error) {
    localStorage.removeItem('token');
    const errorMessage = error.response?.data?.message || error.message || 'Sesi expired';
    console.error('[Auth] Load user error:', errorMessage);
    return rejectWithValue(errorMessage);
  }
});

// Async: login
export const loginUser = createAsyncThunk('auth/loginUser', async ({ username, password }, { rejectWithValue }) => {
  try {
    console.log('[Auth] Attempting login with username:', username);
    const response = await api.post('/auth/login', { username, password });
    const { token, user } = response.data.data;
    console.log('[Auth] Login successful, token received');
    localStorage.setItem('token', token);
    return { token, user };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Login gagal - Server tidak merespons';
    console.error('[Auth] Login error:', errorMessage);
    console.error('[Auth] Full error:', error);
    return rejectWithValue(errorMessage);
  }
});

// Async: logout
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (_) {
    // ignore errors on logout
  } finally {
    localStorage.removeItem('token');
  }
});

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isInitialized = true;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // loadUser
    builder
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.token = null;
      });
    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    // logoutUser
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isInitialized = true;
      });
  },
});

export const { loginSuccess, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
