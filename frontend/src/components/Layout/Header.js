// frontend/src/components/Layout/Header.js
import React from 'react';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';

export default function Header({ onMenuClick }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between p-6">
        <button
          onClick={onMenuClick}
          className="text-gray-600 hover:text-gray-900"
        >
          <FiMenu size={24} />
        </button>

        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:text-gray-900 relative">
            <FiBell size={24} />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-2 border-l pl-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <FiUser size={20} />
            </div>
            <div>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-gray-500">Yogyakarta</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
