// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import DashboardLayout from './components/Layout/DashboardLayout';
import AuthLayout from './components/Layout/AuthLayout';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProductsPage from './pages/Products/ProductsPage';
import ProductDetailPage from './pages/Products/ProductDetailPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import SalesPage from './pages/Sales/SalesPage';
import SalesFormPage from './pages/Sales/SalesFormPage';
import ReportsPage from './pages/Reports/ReportsPage';
import ReceiptPage from './pages/Receipt/ReceiptPage';
import SettingsPage from './pages/Settings/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          
          {/* Products */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          
          {/* Inventory */}
          <Route path="/inventory" element={<InventoryPage />} />
          
          {/* Sales */}
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/sales/new" element={<SalesFormPage />} />
          
          {/* Receipt */}
          <Route path="/receipt" element={<ReceiptPage />} />
          
          {/* Reports */}
          <Route path="/reports" element={<ReportsPage />} />
          
          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
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
