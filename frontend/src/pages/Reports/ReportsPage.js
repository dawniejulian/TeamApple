// frontend/src/pages/Reports/ReportsPage.js
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { exportToPDF, exportToExcel } from '../../utils/export';

export default function ReportsPage() {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';

  const availableTabs = useMemo(() => {
    const tabs = ['dashboard', 'sales', 'cashier', 'payment', 'inventory'];
    if (!isAdmin) {
      return tabs.filter((t) => t !== 'cashier');
    }
    return tabs;
  }, [isAdmin]);

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

  useEffect(() => {
    if (!isAdmin && activeTab === 'cashier') {
      setActiveTab('dashboard');
    }
  }, [isAdmin, activeTab]);

  const handleExportPDF = () => {
    if (!salesReport || !salesReport.transactions) return;
    try {
      const columns = [
        { header: 'No', dataKey: 'no' },
        { header: 'No. Invoice', dataKey: 'invoice_number' },
        { header: 'Tanggal & Waktu', dataKey: 'created_at' },
        { header: 'Produk Terjual', dataKey: 'items_summary' },
        { header: 'Diinput Oleh', dataKey: 'cashier' },
        { header: 'Catatan', dataKey: 'notes' },
        { header: 'Pembayaran', dataKey: 'payment_method' },
        { header: 'Total', dataKey: 'total_amount' }
      ];

      const data = salesReport.transactions.map((tx, index) => [
        index + 1,
        tx.invoice_number,
        new Date(tx.created_at).toLocaleString('id-ID'),
        tx.items_summary || '-',
        `${tx.cashier_name || 'Staf'} (${tx.role_name || 'STAFF'})`,
        tx.notes || '-',
        tx.payment_method || 'CASH',
        `Rp ${parseInt(tx.total_amount || 0).toLocaleString('id-ID')}`
      ]);

      const title = `Laporan Penjualan (${dateRange.from} s.d. ${dateRange.to})`;
      exportToPDF(`Laporan-Penjualan_${dateRange.from}_${dateRange.to}`, title, columns, data);
      toast.success('Laporan PDF berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengekspor PDF');
    }
  };

  const handleExportExcel = () => {
    if (!salesReport || !salesReport.transactions) return;
    try {
      const columns = [
        { header: 'No', dataKey: 'no' },
        { header: 'No. Invoice', dataKey: 'invoice_number' },
        { header: 'Tanggal & Waktu', dataKey: 'created_at' },
        { header: 'Produk Terjual', dataKey: 'items_summary' },
        { header: 'Diinput Oleh', dataKey: 'cashier' },
        { header: 'Catatan', dataKey: 'notes' },
        { header: 'Pembayaran', dataKey: 'payment_method' },
        { header: 'Total', dataKey: 'total_amount' }
      ];

      const data = salesReport.transactions.map((tx, index) => ({
        no: index + 1,
        invoice_number: tx.invoice_number,
        created_at: new Date(tx.created_at).toLocaleString('id-ID'),
        items_summary: tx.items_summary || '-',
        cashier: `${tx.cashier_name || 'Staf'} (${tx.role_name || 'STAFF'})`,
        notes: tx.notes || '-',
        payment_method: tx.payment_method || 'CASH',
        total_amount: tx.total_amount || 0
      }));

      exportToExcel(`Laporan-Penjualan_${dateRange.from}_${dateRange.to}`, 'Laporan Penjualan', columns, data);
      toast.success('Laporan Excel berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengekspor Excel');
    }
  };

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
        {availableTabs.map(tab => (
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
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="card">
                  <p className="text-blue-800/75 text-sm">Total Penjualan</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    Rp {parseInt(salesReport.total_revenue || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="card">
                  <p className="text-blue-800/75 text-sm">Total Transaksi</p>
                  <p className="text-2xl font-bold text-blue-950 mt-2">{salesReport.total_transactions || 0}</p>
                </div>
                <div className="card">
                  <p className="text-blue-800/75 text-sm">Rata-rata Transaksi</p>
                  <p className="text-2xl font-bold text-blue-950 mt-2">
                    Rp {Math.round((salesReport.total_revenue || 0) / (salesReport.total_transactions || 1)).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="card">
                  <p className="text-blue-800/75 text-sm">Total Diskon</p>
                  <p className="text-2xl font-bold text-orange-600 mt-2">
                    Rp {parseInt(salesReport.total_discounts || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Detailed Transactions List */}
              <div className="card overflow-x-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-lg font-bold text-blue-950">Daftar Laporan Penjualan Detail</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportPDF}
                      disabled={!salesReport.transactions || salesReport.transactions.length === 0}
                      className="btn-export-red flex items-center gap-1.5 py-1.5 px-3 text-xs"
                    >
                      📄 Download PDF
                    </button>
                    <button
                      onClick={handleExportExcel}
                      disabled={!salesReport.transactions || salesReport.transactions.length === 0}
                      className="btn-export-green flex items-center gap-1.5 py-1.5 px-3 text-xs"
                    >
                      📊 Download Excel
                    </button>
                  </div>
                </div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="table-head">
                      <th className="pb-3 font-semibold">No. Invoice</th>
                      <th className="pb-3 font-semibold">Tanggal & Waktu</th>
                      <th className="pb-3 font-semibold">Produk Terjual</th>
                      <th className="pb-3 font-semibold">Diinput Oleh</th>
                      <th className="pb-3 font-semibold">Catatan</th>
                      <th className="pb-3 font-semibold">Pembayaran</th>
                      <th className="pb-3 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesReport.transactions && salesReport.transactions.length > 0 ? (
                      salesReport.transactions.map((tx) => (
                        <tr key={tx.id} className="table-row">
                          <td className="py-3 font-mono font-semibold text-blue-950">{tx.invoice_number}</td>
                          <td className="py-3 text-xs text-gray-600">
                            {new Date(tx.created_at).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="py-3 text-blue-950 max-w-[200px] truncate" title={tx.items_summary}>
                            {tx.items_summary || '-'}
                          </td>
                          <td className="py-3 text-xs text-gray-700">
                            <span className="font-semibold">{tx.cashier_name || 'Staf'}</span>
                            <span className="ml-1 text-[9px] uppercase font-extrabold tracking-wide px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">
                              {tx.role_name || 'STAFF'}
                            </span>
                          </td>
                          <td className="py-3 text-xs text-gray-600 max-w-[150px] truncate" title={tx.notes || ''}>
                            {tx.notes || '-'}
                          </td>
                          <td className="py-3">
                            <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {tx.payment_method || 'CASH'}
                            </span>
                          </td>
                          <td className="py-3 font-bold text-blue-950 text-right">
                            Rp {parseInt(tx.total_amount || 0).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-6 text-gray-500">Tidak ada transaksi dalam periode ini</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
