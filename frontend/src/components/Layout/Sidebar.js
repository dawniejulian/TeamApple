// frontend/src/components/Layout/Sidebar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FiHome,
  FiShoppingCart,
  FiBox,
  FiTrendingUp,
  FiPrinter,
  FiSettings,
  FiLogOut,
  FiClock,
  FiTruck,
  FiMonitor,
} from 'react-icons/fi';
import { logoutUser } from '../../store/slices/authSlice';

const ALL_MENU_ITEMS = [
  { icon: FiHome,       label: 'Dashboard',      path: '/',               roles: ['ADMIN','MANAGER','STAFF','VIEWER'] },
  { icon: FiBox,        label: 'Produk',          path: '/products',       roles: ['ADMIN','MANAGER'] },
  { icon: FiShoppingCart, label: 'Stok',          path: '/inventory',      roles: ['ADMIN','MANAGER','STAFF'] },
  { icon: FiTrendingUp, label: 'Penjualan',       path: '/sales',          roles: ['ADMIN','MANAGER','STAFF'] },
  { icon: FiMonitor,    label: 'Display Pelanggan', path: '/customer-display', roles: ['ADMIN','MANAGER','STAFF'] },
  { icon: FiClock,      label: 'Shift',           path: '/shifts',         roles: ['ADMIN','MANAGER','STAFF'] },
  { icon: FiTruck,      label: 'Purchase Order',  path: '/purchase-orders',roles: ['ADMIN','MANAGER'] },
  { icon: FiPrinter,    label: 'Cetak Struk',     path: '/receipt',        roles: ['ADMIN','MANAGER','STAFF'] },
  { icon: FiTrendingUp, label: 'Laporan',          path: '/reports',        roles: ['ADMIN','MANAGER','VIEWER'] },
  { icon: FiSettings,   label: 'Pengaturan',      path: '/settings',       roles: ['ADMIN'] },
];

export default function Sidebar({ isOpen, onToggle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'STAFF';
  const menuItems = ALL_MENU_ITEMS.filter((item) => item.roles.includes(role));

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.info('Anda telah logout');
    navigate('/login');
  };

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-gray-800 text-white transition-all duration-300 min-h-screen flex flex-col`}
    >
      <div className="p-6">
        <h1 className={`font-bold text-xl ${isOpen ? '' : 'text-center'}`}>
          {isOpen ? '💎 KASIRIN' : '💎'}
        </h1>
      </div>

      <nav className="space-y-2 p-4 flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center ${isOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-lg hover:bg-gray-700 transition`}
            title={item.label}
          >
            <item.icon size={24} />
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={handleLogout}
          className={`flex items-center ${isOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-lg hover:bg-gray-700 transition w-full`}
          title="Logout"
        >
          <FiLogOut size={24} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
