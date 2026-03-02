// frontend/src/pages/Dashboard/DashboardPage.js
import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiPackage, FiShoppingCart, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const summaryRes = await api.get('/dashboard/summary');
      const productsRes = await api.get('/dashboard/top-products');
      
      setSummary(summaryRes.data.data);
      setTopProducts(productsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={32} className="text-white" />
      </div>
      <div>
        <p className="text-gray-600 text-sm">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiDollarSign}
          label="Penjualan Hari Ini"
          value={`Rp ${summary?.today?.total_revenue || 0}`}
          color="bg-green-500"
        />
        <StatCard
          icon={FiShoppingCart}
          label="Transaksi Hari Ini"
          value={summary?.today?.total_transactions || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={FiPackage}
          label="Total Produk"
          value={summary?.total_products?.total_products || 0}
          color="bg-purple-500"
        />
        <StatCard
          icon={FiAlertCircle}
          label="Stok Rendah"
          value={summary?.low_stock?.low_stock_products || 0}
          color="bg-red-500"
        />
      </div>

      {/* Top Products */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Produk Terlaris (30 hari)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="pb-3">Produk</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Terjual</th>
                <th className="pb-3">Omzet</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{product.name}</td>
                  <td className="py-3">{product.sku}</td>
                  <td className="py-3">{product.total_quantity}</td>
                  <td className="py-3 font-semibold">
                    Rp {product.total_revenue?.toLocaleString() || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
