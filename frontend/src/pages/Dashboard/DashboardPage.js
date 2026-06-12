// frontend/src/pages/Dashboard/DashboardPage.js
import React, { useEffect, useState } from 'react';
import { FiPackage, FiShoppingCart, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';

const RupiahIcon = ({ className = '' }) => (
  <span className={`${className} font-bold leading-none`}>Rp</span>
);

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);

  const formatNominal = (value) => {
    const amount = Number(value) || 0;
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount);
  };

  const getNominalClass = (value) => {
    const length = formatNominal(value).length;

    if (length >= 16) return 'text-xl';
    if (length >= 13) return 'text-2xl';
    return 'text-3xl';
  };

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
    <div className="card flex items-center space-x-4 section-enter">
      <div className={`p-3 rounded-xl shadow-lg ${color}`}>
        <Icon className="text-white text-4xl" />
      </div>
      <div className="min-w-0">
        <p className="text-blue-800/75 text-sm">{label}</p>
        <p className={`font-bold text-blue-950 leading-tight break-words ${getNominalClass(value)}`}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold page-title section-enter">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={RupiahIcon}
          label="Penjualan Hari Ini"
          value={formatNominal(summary?.today?.total_revenue)}
          color="bg-gradient-to-br from-emerald-400 to-emerald-600"
        />
        <StatCard
          icon={FiShoppingCart}
          label="Transaksi Hari Ini"
          value={summary?.today?.total_transactions || 0}
          color="bg-gradient-to-br from-sky-400 to-blue-600"
        />
        <StatCard
          icon={FiPackage}
          label="Total Produk"
          value={summary?.total_products?.total_products || 0}
          color="bg-gradient-to-br from-indigo-400 to-indigo-600"
        />
        <StatCard
          icon={FiAlertCircle}
          label="Stok Rendah"
          value={summary?.low_stock?.low_stock_products || 0}
          color="bg-gradient-to-br from-rose-400 to-rose-600"
        />
      </div>

      {/* Top Products */}
      <div className="card section-enter">
        <h2 className="text-xl font-bold mb-4 text-blue-950">Produk Terlaris (30 hari)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-blue-100">
                <th className="pb-3 text-blue-800/80">Produk</th>
                <th className="pb-3 text-blue-800/80">SKU</th>
                <th className="pb-3 text-blue-800/80">Terjual</th>
                <th className="pb-3 text-blue-800/80">Omzet</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.id} className="border-b border-blue-100/60 hover:bg-blue-50/70 transition">
                  <td className="py-3 text-blue-950">{product.name}</td>
                  <td className="py-3 text-blue-900/80">{product.sku}</td>
                  <td className="py-3 text-blue-900/80">{product.total_quantity}</td>
                  <td className="py-3 font-semibold text-blue-950">
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
