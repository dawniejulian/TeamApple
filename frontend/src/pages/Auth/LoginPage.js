// frontend/src/pages/Auth/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      return;
    }

    const role = String(user?.role || '').toUpperCase();
    if (role === 'ADMIN' || role === 'STAFF') {
      navigate('/pos');
      return;
    }

    navigate('/');
  }, [token, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ username, password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Selamat datang, ${result.payload.user.first_name || result.payload.user.username}!`);
      const role = String(result.payload.user.role || '').toUpperCase();
      if (role === 'ADMIN' || role === 'STAFF') {
        navigate('/pos');
        return;
      }
      navigate('/');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass-panel login-card p-8 sm:p-9">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold brand-gradient-text">TeamApple.Hub</h1>
          <p className="text-blue-800/70 mt-2 text-sm sm:text-base">Sistem Manajemen Stok & Penjualan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input pr-10"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-blue-700/70 hover:text-blue-900"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary font-semibold py-2"
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
