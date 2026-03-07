// frontend/src/components/Layout/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiHome,
  FiShoppingCart,
  FiBox,
  FiTrendingUp,
  FiPrinter,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';

export default function Sidebar({ isOpen, onToggle }) {
  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/' },
    { icon: FiBox, label: 'Produk', path: '/products' },
    { icon: FiShoppingCart, label: 'Stok', path: '/inventory' },
    { icon: FiTrendingUp, label: 'Penjualan', path: '/sales' },
    { icon: FiPrinter, label: 'Cetak Struk', path: '/receipt' },
    { icon: FiTrendingUp, label: 'Laporan', path: '/reports' },
    { icon: FiSettings, label: 'Pengaturan', path: '/settings' },
  ];

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-gray-800 text-white transition-all duration-300`}
    >
      <div className="p-6">
        <h1 className={`font-bold text-xl ${isOpen ? '' : 'text-center'}`}>
          {isOpen ? '💎 KASIRIN' : '💎'}
        </h1>
      </div>

      <nav className="space-y-2 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition"
            title={item.label}
          >
            <item.icon size={24} />
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-6 left-0 right-0 p-4">
        <button
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition w-full"
          title="Logout"
        >
          <FiLogOut size={24} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
