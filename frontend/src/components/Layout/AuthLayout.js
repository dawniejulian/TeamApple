// frontend/src/components/Layout/AuthLayout.js
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AuthLayout() {
  const { token, user } = useSelector((state) => state.auth);

  // Already logged in - send internal users to POS, customer to public site
  if (token) {
    const role = String(user?.role || '').toUpperCase();
    if (role === 'ADMIN' || role === 'STAFF') {
      return <Navigate to="/pos" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-shell flex items-center justify-center px-4 py-8 overflow-hidden">
      <div className="app-bg-orb app-bg-orb-1" aria-hidden="true" />
      <div className="app-bg-orb app-bg-orb-2" aria-hidden="true" />
      <div className="app-bg-orb app-bg-orb-3" aria-hidden="true" />

      <div className="w-full relative z-10 flex justify-center section-enter">
        <Outlet />
      </div>
    </div>
  );
}
