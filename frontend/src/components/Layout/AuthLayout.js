// frontend/src/components/Layout/AuthLayout.js
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AuthLayout() {
  const { token } = useSelector((state) => state.auth);

  // Already logged in - redirect to dashboard
  if (token) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <Outlet />
    </div>
  );
}
