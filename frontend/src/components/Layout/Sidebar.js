// frontend/src/components/Layout/Sidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
} from 'react-icons/fi';
import { logoutUser } from '../../store/slices/authSlice';

const ALL_MENU_ITEMS = [
  { icon: FiHome,         label: 'Dashboard',      path: '/dashboard',       roles: ['ADMIN', 'STAFF'] },
  { icon: FiBox,          label: 'Produk',          path: '/products',        roles: ['ADMIN', 'STAFF'] },
  { icon: FiShoppingCart, label: 'Stok',            path: '/inventory',       roles: ['ADMIN', 'STAFF'] },
  { icon: FiTrendingUp,   label: 'Kasir POS',       path: '/pos',             roles: ['ADMIN', 'STAFF'] },
  { icon: FiClock,        label: 'Shift',           path: '/shifts',          roles: ['ADMIN', 'STAFF'] },
  { icon: FiTruck,        label: 'Purchase Order',  path: '/purchase-orders', roles: ['ADMIN', 'STAFF'] },
  { icon: FiPrinter,      label: 'Cetak Struk',     path: '/receipt',         roles: ['ADMIN', 'STAFF'], hidden: true },
  { icon: FiTrendingUp,   label: 'Laporan',          path: '/reports',         roles: ['ADMIN', 'STAFF'] },
  { icon: FiSettings,    label: 'Pengaturan',       path: '/settings',        roles: ['ADMIN'] },
];

export default function Sidebar({ isOpen, onToggle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const role = String(user?.role || 'STAFF').toUpperCase();
  const menuItems = ALL_MENU_ITEMS.filter((item) => item.roles.includes(role) && !item.hidden);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.info('Anda telah logout');
    navigate('/');
  };

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } glass-panel-soft text-[#2a467b] transition-all duration-300 min-h-screen flex flex-col m-3 mr-0 rounded-2xl border-blue-200/60 relative z-10`}
    >
      <div className="p-5 pb-4 border-b border-blue-200/60 flex items-center justify-between">
        <div className="min-w-0">
          <h1 className={`font-extrabold text-lg tracking-tight text-[#28427a] ${isOpen ? '' : 'text-center'}`}>
            {isOpen ? 'TeamApple.Hub' : 'TAH'}
          </h1>
        </div>
        {isOpen && (
          <button
            type="button"
            onClick={onToggle}
            className="w-8 h-8 rounded-full border border-blue-200/70 text-[#2a467b] text-xs font-semibold hover:bg-white/80 transition"
            title="Collapse sidebar"
          >
            {'<'}
          </button>
        )}
      </div>

      <nav className="space-y-2 p-3 flex-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-pill flex items-center ${isOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-xl text-sm font-medium ${
                isActive ? 'nav-pill-active text-white shadow-md shadow-blue-400/20' : 'text-[#3a578f] hover:text-[#2c477d]'
              }`
            }
            title={item.label}
          >
            <item.icon size={20} />
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-blue-200/60">
        <button
          onClick={handleLogout}
          className={`nav-pill flex items-center ${isOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-xl text-[#3a578f] hover:text-[#2c477d] transition w-full`}
          title="Logout"
        >
          <FiLogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
