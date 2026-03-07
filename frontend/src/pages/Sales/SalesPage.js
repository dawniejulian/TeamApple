// frontend/src/pages/Sales/SalesPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { exportToPDF, exportToExcel } from '../../utils/export';
import AddSaleModal from '../../components/Modal/AddSaleModal';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales');
      setSales(res.data.data);
    } catch (error) {
      toast.error('Gagal mengambil data penjualan');
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
        format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm', { locale: id }),
        sale.channel_name || '-',
        sale.customer_name || '-',
        `Rp ${sale.total_amount?.toLocaleString('id-ID') || '0'}`,
      ]);

      exportToPDF('Laporan-Penjualan', 'Laporan Penjualan', columns, data);
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengekspor PDF');
      console.error('Error:', error);
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
        date: format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm', { locale: id }),
        channel_name: sale.channel_name || '-',
        customer_name: sale.customer_name || '-',
        total_amount: sale.total_amount || '0',
      }));

      exportToExcel('Laporan-Penjualan', 'Penjualan', columns, data);
      toast.success('Excel berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengekspor Excel');
      console.error('Error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Penjualan</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus /> <span>Transaksi Baru</span>
        </button>
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

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : sales.length === 0 ? (
          <p className="text-center py-8 text-gray-500">Tidak ada penjualan</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-3">No. Invoice</th>
                <th className="pb-3">Tanggal</th>
                <th className="pb-3">Channel</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 font-mono">{sale.invoice_number}</td>
                  <td className="py-3">
                    {format(new Date(sale.created_at), 'dd MMM yyyy HH:mm', {
                      locale: id,
                    })}
                  </td>
                  <td className="py-3">{sale.channel_name}</td>
                  <td className="py-3">{sale.customer_name || '-'}</td>
                  <td className="py-3 font-semibold">
                    Rp {sale.total_amount?.toLocaleString('id-ID') || 0}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        sale.transaction_status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {sale.transaction_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddSaleModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchSales();
          }}
        />
      )}
    </div>
  );
}
