// frontend/src/pages/Reports/ReportsPage.js
import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [cashierPerformance, setCashierPerformance] = useState([]);
  const [paymentReport, setPaymentReport] = useState([]);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      switch(activeTab) {
        case 'dashboard':
          const dashRes = await api.get('/reports/dashboard/overview');
          setDashboardData(dashRes.data.data);
          break;
        case 'sales':
          const salesRes = await api.get(`/reports/sales/period?from=${dateRange.from}&to=${dateRange.to}`);
          setSalesReport(salesRes.data.data);
          break;
        case 'cashier':
          const cashierRes = await api.get(`/reports/cashier/performance?from=${dateRange.from}&to=${dateRange.to}`);
          setCashierPerformance(cashierRes.data.data || []);
          break;
        case 'payment':
          const paymentRes = await api.get(`/reports/payments/breakdown?from=${dateRange.from}&to=${dateRange.to}`);
          setPaymentReport(paymentRes.data.data || []);
          break;
        case 'inventory':
          const invRes = await api.get('/reports/inventory/valuation');
          setInventoryReport(invRes.data.data);
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Gagal mengambil laporan');
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold page-title section-enter">Laporan & Analitik</h1>
      </div>

      {/* Date Range Filter - hanya untuk tab yang bukan dashboard dan inventory */}
      {(activeTab === 'sales' || activeTab === 'cashier' || activeTab === 'payment') && (
        <div className="card">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dari Tanggal</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label mb-2">Hingga Tanggal</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchReports}
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-blue-100 pb-2">
        {['dashboard', 'sales', 'cashier', 'payment', 'inventory'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-pill ${
              activeTab === tab
                ? 'tab-pill-active'
                : ''
            }`}
          >
            {tab === 'dashboard' && 'Ringkasan'}
            {tab === 'sales' && 'Penjualan'}
            {tab === 'cashier' && 'Performa Kasir'}
            {tab === 'payment' && 'Metode Pembayaran'}
            {tab === 'inventory' && 'Valuasi Stok'}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="card text-center py-8">
          <p>Memuat laporan...</p>
        </div>
      ) : (
        <>
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && dashboardData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card">
                <p className="text-blue-800/75 text-sm">Penjualan Hari Ini</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  Rp {parseInt(dashboardData.today?.revenue || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-blue-700/70 mt-1">{dashboardData.today?.transactions} transaksi</p>
              </div>
              <div className="card">
                <p className="text-blue-800/75 text-sm">Penjualan Bulan Ini</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  Rp {parseInt(dashboardData.month?.revenue || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-blue-700/70 mt-1">{dashboardData.month?.transactions} transaksi</p>
              </div>
              <div className="card">
                <p className="text-blue-800/75 text-sm">Stok Rendah</p>
                <p className="text-2xl font-bold text-orange-600 mt-2">{dashboardData.alerts?.low_stock}</p>
                <p className="text-xs text-blue-700/70 mt-1">produk</p>
              </div>
              <div className="card">
                <p className="text-blue-800/75 text-sm">PO Terbuka</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">{dashboardData.alerts?.open_pos}</p>
                <p className="text-xs text-blue-700/70 mt-1">purchase order</p>
              </div>
            </div>
          )}

          {/* Sales Report */}
          {activeTab === 'sales' && salesReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="card">
                  <p className="text-blue-800/75 text-sm">Total Penjualan</p>
                  <p className="text-2xl font-bold text-green-600">
                    Rp {parseInt(salesReport.total_revenue || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="card">
                  <p className="text-blue-800/75 text-sm">Total Transaksi</p>
                  <p className="text-2xl font-bold text-blue-950">{salesReport.total_transactions || 0}</p>
                </div>
                <div className="card">
                  <p className="text-blue-800/75 text-sm">Rata-rata Transaksi</p>
                  <p className="text-2xl font-bold text-blue-950">
                    Rp {Math.round((salesReport.total_revenue || 0) / (salesReport.total_transactions || 1)).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="card">
                  <p className="text-blue-800/75 text-sm">Total Diskon</p>
                  <p className="text-2xl font-bold text-orange-600">
                    Rp {parseInt(salesReport.total_discounts || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cashier Performance */}
          {activeTab === 'cashier' && (
            <div className="card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="table-head">
                    <th className="pb-3 font-semibold">Nama Kasir</th>
                    <th className="pb-3 font-semibold">Transaksi</th>
                    <th className="pb-3 font-semibold">Total Penjualan</th>
                    <th className="pb-3 font-semibold">Rata-rata</th>
                    <th className="pb-3 font-semibold">% Diskon</th>
                  </tr>
                </thead>
                <tbody>
                  {cashierPerformance.map((cashier) => (
                    <tr key={cashier.id} className="table-row">
                      <td className="py-3 font-semibold">{cashier.cashier_name}</td>
                      <td className="py-3">{cashier.transaction_count || 0}</td>
                      <td className="py-3">Rp {parseInt(cashier.total_sales || 0).toLocaleString('id-ID')}</td>
                      <td className="py-3">
                        Rp {Math.round((cashier.total_sales || 0) / (cashier.transaction_count || 1)).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3">
                        {((parseFloat(cashier.total_discounts || 0) / (parseFloat(cashier.total_sales) || 1)) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Payment Methods */}
          {activeTab === 'payment' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentReport.map((payment, idx) => (
                <div key={idx} className="card">
                  <p className="text-blue-800/75 text-sm font-semibold">{payment.payment_method}</p>
                  <p className="text-2xl font-bold mt-3 text-blue-950">
                    Rp {parseInt(payment.total_amount || 0).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-blue-700/75 mt-2">
                    {payment.transaction_count || 0} transaksi
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Inventory Valuation */}
          {activeTab === 'inventory' && inventoryReport && (
            <div className="space-y-4">
              <div className="card">
                <p className="text-blue-800/75 text-sm">Total Valuasi Stok</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  Rp {parseInt(inventoryReport.total_valuation || 0).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="card overflow-x-auto">
                <h3 className="text-lg font-bold mb-4 text-blue-950">Valuasi per Produk</h3>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="table-head">
                      <th className="pb-3 font-semibold">Produk</th>
                      <th className="pb-3 font-semibold">Qty</th>
                      <th className="pb-3 font-semibold">Harga Beli</th>
                      <th className="pb-3 font-semibold">Total Valuasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryReport.items?.map((item, idx) => (
                      <tr key={idx} className="table-row">
                        <td className="py-3">{item.product_name}</td>
                        <td className="py-3 font-semibold">{item.quantity || 0}</td>
                        <td className="py-3">Rp {parseInt(item.purchase_price || 0).toLocaleString('id-ID')}</td>
                        <td className="py-3 font-bold">
                          Rp {parseInt(item.valuation || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
