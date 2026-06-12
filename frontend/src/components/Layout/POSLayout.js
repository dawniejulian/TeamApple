import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiLogOut, FiMonitor, FiAlertTriangle, FiSmartphone, FiCopy, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { loadUser, logoutUser } from '../../store/slices/authSlice';
import api from '../../services/api';
import { getDeviceId } from '../../utils/deviceFingerprint';

export default function POSLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user, isInitialized } = useSelector((state) => state.auth);
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';

  const [deviceStatus, setDeviceStatus] = useState('checking'); // 'checking' | 'allowed' | 'blocked'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!user) {
      dispatch(loadUser());
    }
  }, [token, user, dispatch, navigate]);

  useEffect(() => {
    if (isInitialized && !token) {
      navigate('/login');
    }
  }, [isInitialized, token, navigate]);

  // Check if this device is registered as a store device
  useEffect(() => {
    if (!user) return;

    const checkDevice = async () => {
      try {
        const res = await api.get('/devices/check');
        if (res.data.is_registered) {
          setDeviceStatus('allowed');
        } else {
          setDeviceStatus('blocked');
        }
      } catch (error) {
        // If check fails for admin, still allow (backend is the real gate)
        if (isAdmin) {
          setDeviceStatus('allowed');
        } else {
          setDeviceStatus('blocked');
        }
      }
    };

    checkDevice();
  }, [user, isAdmin]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.info('Anda telah logout');
    navigate('/');
  };

  const handleCopyDeviceId = () => {
    const deviceId = getDeviceId();
    navigator.clipboard.writeText(deviceId).then(() => {
      setCopied(true);
      toast.success('Device ID disalin!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!token) return null;

  // Show loading while checking device
  if (deviceStatus === 'checking') {
    return (
      <div className="min-h-screen bg-[#eef3fb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#2d4f89] font-medium">Memverifikasi perangkat...</p>
        </div>
      </div>
    );
  }

  // Staff on unregistered device → show blocked screen
  if (deviceStatus === 'blocked') {
    const deviceId = getDeviceId();
    return (
      <div className="min-h-screen bg-[#eef3fb] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="text-red-500" size={32} />
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Perangkat Belum Terdaftar
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Perangkat ini belum terdaftar sebagai perangkat kasir toko.
            Minta <strong>Admin</strong> untuk mendaftarkan perangkat ini agar kamu bisa mengakses kasir.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <FiSmartphone className="text-gray-400" size={16} />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Device ID Perangkat Ini</span>
            </div>
            <p className="font-mono text-xs text-gray-700 break-all bg-white rounded-lg p-3 border border-gray-200">
              {deviceId}
            </p>
            <button
              onClick={handleCopyDeviceId}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition"
            >
              {copied ? <><FiCheck size={16} /> Tersalin!</> : <><FiCopy size={16} /> Salin Device ID</>}
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Tunjukkan Device ID di atas ke Admin. Admin bisa mendaftarkan perangkat ini melalui menu <strong>Pengaturan → Perangkat Toko</strong>.
          </p>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Normal POS layout for authorized users
  return (
    <div className="min-h-screen bg-[#eef3fb] text-[#1e355f]">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {(isAdmin || String(user?.role || '').toUpperCase() === 'STAFF') && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-[#2d4f89] hover:bg-blue-50 transition"
              >
                <FiArrowLeft />
                Dashboard
              </button>
            )}
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-[#5675ad] font-semibold">Mode Kasir</p>
              <h1 className="text-lg sm:text-xl font-extrabold truncate">TeamApple.Hub POS</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.open('/customer-display', '_blank', 'noopener,noreferrer')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              <FiMonitor />
              Display
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-[#2d4f89] hover:bg-blue-50 transition"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="glass-panel rounded-2xl min-h-[calc(100vh-120px)] p-4 sm:p-6 section-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}