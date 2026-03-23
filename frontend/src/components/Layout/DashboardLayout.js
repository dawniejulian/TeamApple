// frontend/src/components/Layout/DashboardLayout.js
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from '../../store/slices/authSlice';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user, isInitialized } = useSelector((state) => state.auth);

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

  if (!token) return null;

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <div className="app-bg-orb app-bg-orb-1" aria-hidden="true" />
      <div className="app-bg-orb app-bg-orb-2" aria-hidden="true" />
      <div className="app-bg-orb app-bg-orb-3" aria-hidden="true" />

      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6">
          <div className="glass-panel rounded-2xl min-h-full p-4 sm:p-6 section-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
