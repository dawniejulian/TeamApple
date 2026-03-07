// frontend/src/pages/Reports/ReportsPage.js
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '../../services/api';
import { exportToPDF, exportToExcel } from '../../utils/export';

export default function ReportsPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales');
      setSales(response.data?.data || []);
    } catch (error) {
      toast.error('Gagal memuat data penjualan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const columns = [
        { header: 'No', dataKey: 'no' },
        { header: 'No. Invoice', dataKey: 'invoice_number' },
        { header: 'Tanggal', dataKey: 'date' },
        { header: 'Channel', dataKey: 'channel_name' },
        { header: 'Customer', dataKey: 'customer_name' },
        { header: 'Total', dataKey: 'total_amount' },
      ];

      const data = sales.map((sale, index) => [
        index + 1,
        sale.invoice_number || '-',
        format(new Date(sale.created_at), 'dd/MM/yyyy', { locale: id }),
        sale.channel_name || '-',
        sale.customer_name || '-',
        `Rp ${sale.total_amount?.toLocaleString('id-ID') || '0'}`,
      ]);

      exportToPDF('Laporan-Penjualan', 'Laporan Penjualan', columns, data);
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengekspor PDF');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const columns = [
        { header: 'No', dataKey: 'no' },
        { header: 'No. Invoice', dataKey: 'invoice_number' },
        { header: 'Tanggal', dataKey: 'date' },
        { header: 'Channel', dataKey: 'channel_name' },
        { header: 'Customer', dataKey: 'customer_name' },
        { header: 'Total', dataKey: 'total_amount' },
      ];

      const data = sales.map((sale, index) => ({
        no: index + 1,
        invoice_number: sale.invoice_number || '-',
        date: format(new Date(sale.created_at), 'dd/MM/yyyy', { locale: id }),
        channel_name: sale.channel_name || '-',
        customer_name: sale.customer_name || '-',
        total_amount: sale.total_amount || '0',
      }));

      exportToExcel('Laporan-Penjualan', 'Penjualan', columns, data);
      toast.success('Excel berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengekspor Excel');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const totalSales = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Laporan Penjualan</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div>
            <p className="text-sm text-gray-600">Total Transaksi</p>
            <p className="text-2xl font-bold text-blue-600">{sales.length}</p>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div>
            <p className="text-sm text-gray-600">Total Penjualan</p>
            <p className="text-2xl font-bold text-green-600">
              Rp {totalSales.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div>
            <p className="text-sm text-gray-600">Rata-rata Transaksi</p>
            <p className="text-2xl font-bold text-purple-600">
              Rp {sales.length > 0 ? (totalSales / sales.length).toLocaleString('id-ID') : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExportPDF}
          disabled={sales.length === 0 || exporting}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
        >
          {exporting ? '⏳ Sedang...' : '📄 Download PDF'}
        </button>
        <button
          onClick={handleExportExcel}
          disabled={sales.length === 0 || exporting}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
        >
          {exporting ? '⏳ Sedang...' : '📊 Download Excel'}
        </button>
      </div>

      {/* Sales Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-center py-8">Memuat laporan...</p>
        ) : sales.length === 0 ? (
          <p className="text-center py-8 text-gray-500">Belum ada data penjualan</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-3 font-semibold text-gray-900">No.</th>
                <th className="px-6 py-3 font-semibold text-gray-900">No. Invoice</th>
                <th className="px-6 py-3 font-semibold text-gray-900">Tanggal</th>
                <th className="px-6 py-3 font-semibold text-gray-900">Channel</th>
                <th className="px-6 py-3 font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-3 font-semibold text-gray-900 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => (
                <tr key={sale.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900">{index + 1}</td>
                  <td className="px-6 py-3 font-mono text-gray-900">{sale.invoice_number}</td>
                  <td className="px-6 py-3 text-gray-900">
                    {format(new Date(sale.created_at), 'dd MMM yyyy', {
                      locale: id,
                    })}
                  </td>
                  <td className="px-6 py-3 text-gray-900">{sale.channel_name || '-'}</td>
                  <td className="px-6 py-3 text-gray-900">{sale.customer_name || '-'}</td>
                  <td className="px-6 py-3 text-gray-900 text-right font-semibold">
                    Rp {sale.total_amount?.toLocaleString('id-ID') || '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
