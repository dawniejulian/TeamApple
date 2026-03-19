// frontend/src/components/Layout/Header.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
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

  const fetchNotifications = async () => {
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
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.info('Anda telah logout');
    navigate('/login');
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
  }, [isNotificationOpen]);

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

  const roleLabel = user?.role || '';

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onMenuClick}
          className="text-gray-600 hover:text-gray-900"
        >
          <FiMenu size={24} />
        </button>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleToggleNotification}
              className="text-gray-600 hover:text-gray-900 relative"
              title="Notifikasi"
            >
              <FiBell size={24} />
              {hasUnreadNotification && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-xl border border-gray-200 bg-white shadow-xl z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">Notifikasi</p>
                  <p className="text-xs text-gray-500">
                    {notificationData.fetchedAt
                      ? `Update ${notificationData.fetchedAt.toLocaleTimeString('id-ID')}`
                      : 'Belum ada data'}
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-500 text-center">
                      Tidak ada notifikasi baru
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 border-l pl-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{displayName}</p>
              <p className="text-xs text-gray-500">{roleLabel}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
