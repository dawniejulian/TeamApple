// frontend/src/components/Layout/Header.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiLogOut } from 'react-icons/fi';
import { logoutUser } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function Header({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ lowStock: 0, openPOs: 0, fetchedAt: null });
  const notificationRef = useRef(null);

  const notifications = useMemo(() => {
    const items = [];

    if (notificationData.lowStock > 0) {
      items.push({
        id: 'low-stock',
        title: 'Stok Menipis',
        message: `${notificationData.lowStock} produk perlu restock`
      });
    }

    if (notificationData.openPOs > 0) {
      items.push({
        id: 'open-pos',
        title: 'Purchase Order Aktif',
        message: `${notificationData.openPOs} PO masih terbuka`
      });
    }

    return items;
  }, [notificationData]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/reports/dashboard/overview');
      const alerts = response?.data?.data?.alerts || {};

      const nextData = {
        lowStock: Number(alerts.low_stock || 0),
        openPOs: Number(alerts.open_pos || 0),
        fetchedAt: new Date()
      };

      setNotificationData(nextData);

      if (!isNotificationOpen && (nextData.lowStock > 0 || nextData.openPOs > 0)) {
        setHasUnreadNotification(true);
      }
    } catch (_) {
      // Keep header stable if notifications endpoint is temporarily unavailable.
    }
  }, [isNotificationOpen]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.info('Anda telah logout');
    navigate('/');
  };

  const handleToggleNotification = async () => {
    const nextOpen = !isNotificationOpen;
    setIsNotificationOpen(nextOpen);

    if (nextOpen) {
      setHasUnreadNotification(false);
      await fetchNotifications();
    }
  };

  useEffect(() => {
    fetchNotifications();

    const timer = setInterval(fetchNotifications, 30000);

    return () => clearInterval(timer);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!notificationRef.current) return;
      if (!notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
    : 'Loading...';

  const roleLabel = String(user?.role || '').toUpperCase() === 'ADMIN' ? 'Admin / Pemilik' : 'Staff';

  return (
    <header className="px-3 pt-3 sm:px-5 sm:pt-5 relative z-20">
      <div className="glass-panel rounded-2xl flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <button
          onClick={onMenuClick}
          className="w-10 h-10 rounded-xl bg-white/70 border border-blue-200/60 text-blue-900 hover:bg-white transition"
          title="Toggle sidebar"
        >
          <FiMenu size={22} className="mx-auto" />
        </button>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleToggleNotification}
              className="w-10 h-10 rounded-xl bg-white/70 border border-blue-200/60 text-blue-900 hover:bg-white transition relative"
              title="Notifikasi"
            >
              <FiBell size={20} className="mx-auto" />
              {hasUnreadNotification && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full status-dot"></span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-blue-200/60 bg-white/95 shadow-2xl backdrop-blur-md z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-white to-blue-50/70">
                  <p className="text-sm font-semibold text-blue-950">Notifikasi</p>
                  <p className="text-xs text-blue-700/70">
                    {notificationData.fetchedAt
                      ? `Update ${notificationData.fetchedAt.toLocaleTimeString('id-ID')}`
                      : 'Belum ada data'}
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-blue-700/70 text-center">
                      Tidak ada notifikasi baru
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className="px-4 py-3 border-b border-blue-100/70 last:border-b-0 hover:bg-blue-50/70 transition"
                      >
                        <p className="text-sm font-semibold text-blue-950">{item.title}</p>
                        <p className="text-sm text-blue-900/80 mt-1">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 border-l border-blue-200/70 pl-3 sm:pl-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-800/20">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-blue-950">{displayName}</p>
              <p className="text-xs text-blue-700/75 tracking-wide">{roleLabel}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 w-9 h-9 rounded-lg border border-blue-200/70 text-blue-800 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <FiLogOut size={18} className="mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
