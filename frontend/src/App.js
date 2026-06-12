// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import DashboardLayout from './components/Layout/DashboardLayout';
import AuthLayout from './components/Layout/AuthLayout';
import POSLayout from './components/Layout/POSLayout';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProductsPage from './pages/Products/ProductsPage';
import ProductDetailPage from './pages/Products/ProductDetailPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import SalesPage from './pages/Sales/SalesPage';
import SalesFormPage from './pages/Sales/SalesFormPage';
import ShiftsPage from './pages/Shifts/ShiftsPage';
import PurchaseOrdersPage from './pages/PurchaseOrders/PurchaseOrdersPage';
import ReportsPage from './pages/Reports/ReportsPage';
import ReceiptPage from './pages/Receipt/ReceiptPage';
import SettingsPage from './pages/Settings/SettingsPage';
import TeamAppleLandingPage from './pages/Public/TeamAppleLandingPage';
import { loadUser } from './store/slices/authSlice';

const DASHBOARD_ROLES = ['ADMIN', 'STAFF'];
const POS_ROLES = ['ADMIN', 'STAFF'];

function RoleProtectedRoute({ allowedRoles, redirectCustomerHome, children }) {
  const { token, user, isInitialized } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user && !isInitialized) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedUserRole = String(user.role || '').toUpperCase();
  const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toUpperCase());

  // Customer that tries to access dashboard → redirect to homepage
  if (normalizedUserRole === 'CUSTOMER') {
    return <Navigate to="/" replace />;
  }

  if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const dispatch = useDispatch();
  const { token, user, isInitialized, isLoading } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (token && !user && !isInitialized && !isLoading) {
      dispatch(loadUser());
    }
  }, [token, user, isInitialized, isLoading, dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public TeamApple website for customer */}
        <Route path="/" element={<TeamAppleLandingPage />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Dashboard: accessible by ADMIN and STAFF from any device */}
        <Route
          element={(
            <RoleProtectedRoute allowedRoles={DASHBOARD_ROLES}>
              <DashboardLayout />
            </RoleProtectedRoute>
          )}
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Products */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          {/* Inventory */}
          <Route path="/inventory" element={<InventoryPage />} />

          {/* Shifts */}
          <Route path="/shifts" element={<ShiftsPage />} />

          {/* Purchase Orders */}
          <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />

          {/* Receipt */}
          <Route path="/receipt" element={<ReceiptPage />} />

          {/* Reports */}
          <Route path="/reports" element={<ReportsPage />} />

          {/* Settings: ADMIN only */}
          <Route
            path="/settings"
            element={(
              <RoleProtectedRoute allowedRoles={['ADMIN']}>
                <SettingsPage />
              </RoleProtectedRoute>
            )}
          />

        </Route>

        {/* POS Kasir: ADMIN from anywhere, STAFF only from registered devices (enforced in POSLayout) */}
        <Route
          element={(
            <RoleProtectedRoute allowedRoles={POS_ROLES}>
              <POSLayout />
            </RoleProtectedRoute>
          )}
        >
          <Route path="/pos" element={<SalesPage />} />
          <Route path="/pos/new" element={<SalesFormPage />} />
        </Route>

        {/* Backward-compatible routes */}
        <Route path="/sales" element={<Navigate to="/pos" replace />} />
        <Route path="/sales/new" element={<Navigate to="/pos/new" replace />} />
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;
