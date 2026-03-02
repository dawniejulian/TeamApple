// frontend/src/pages/Auth/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock login - replace with actual API call
      if (username === 'admin' || username === 'staff1') {
        dispatch(loginSuccess({
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: username,
            role: username === 'admin' ? 'ADMIN' : 'STAFF',
          },
        }));
        toast.success('Login berhasil!');
        navigate('/');
      } else {
        toast.error('Username atau password salah');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">💎 KASIRIN</h1>
        <p className="text-center text-gray-600 mb-8">
          Sistem Manajemen Stok & Penjualan
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn-primary font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p>Demo Credentials:</p>
          <p>Username: <strong>admin</strong> or <strong>staff1</strong></p>
          <p>Password: <strong>any</strong></p>
        </div>
      </div>
    </div>
  );
}
