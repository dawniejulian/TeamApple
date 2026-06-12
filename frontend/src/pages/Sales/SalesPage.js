// frontend/src/pages/Sales/SalesPage.js
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiPlus, FiActivity, FiPrinter } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { exportToPDF, exportToExcel } from '../../utils/export';
import AddSaleModal from '../../components/Modal/AddSaleModal';
import ActivityLogPanel from './ActivityLogPanel';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(true);
  const { user } = useSelector((state) => state.auth);

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

  const handlePrintReceipt = async (saleId) => {
    try {
      const detail = await api.get(`/sales/${saleId}`);
      const d = detail.data.data;
      const items = d.items || [];

      const formatRp = (n) => 'Rp ' + parseInt(n || 0).toLocaleString('id-ID');
      const tgl = new Date(d.created_at).toLocaleDateString('id-ID');
      const jam = new Date(d.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      const itemsHtml = items.map(item => `
        <div style="margin-bottom:4px">
          <div style="font-weight:600">${item.product_name}</div>
          <div style="display:flex;justify-content:space-between">
            <span>${formatRp(item.price || item.unit_price)} x ${item.quantity}</span>
            <span style="font-weight:bold">${formatRp(item.subtotal)}</span>
          </div>
        </div>
      `).join('');

      const html = `
        <html><head><title>Struk ${d.invoice_number || d.sales_number}</title>
        <style>
          @page { size: 80mm auto; margin: 4mm; }
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; width: 80mm; }
          body { font-family: monospace; font-size: 11px; line-height: 1.4; }
          .center { text-align: center; }
          .flex { display: flex; justify-content: space-between; }
          .bold { font-weight: bold; }
          .sep { border-bottom: 2px solid #000; margin: 5px 0; }
          .sep-blue { border-bottom: 3px solid #2563eb; margin: 6px 0; }
          .total-box { border: 2px solid #2563eb; border-radius:4px; padding:3px 4px; }
          .blue { color: #2563eb; }
        </style></head><body>
        <div class="center">
          <div class="bold blue" style="font-size:14px">&#128142; TeamApple.Hub</div>
          <div style="font-size:11px">Toko Apple Terpercaya</div>
        </div>
        <div class="sep-blue"></div>
        <div class="flex"><span>Invoice:</span><span class="bold blue">${d.invoice_number || d.sales_number}</span></div>
        <div class="flex"><span>Tanggal:</span><span>${tgl}</span></div>
        <div class="flex"><span>Waktu:</span><span>${jam}</span></div>
        <div class="flex"><span>Customer:</span><span>${d.customer_name || 'Walk-in Customer'}</span></div>
        <div class="sep"></div>
        ${itemsHtml}
        <div class="sep"></div>
        <div class="flex total-box bold"><span>TOTAL BAYAR</span><span class="blue">${formatRp(d.total_amount)}</span></div>
        <div class="flex" style="margin-top:4px"><span>Metode Bayar:</span><span class="bold">${d.payment_method || 'CASH'}</span></div>
        <div class="sep"></div>
        <div class="center">
          <div class="bold">&#10003; Terima Kasih Telah Berbelanja &#10003;</div>
          <div style="color:#6b7280;margin-top:4px">&#11088; Powered by TeamApple.Hub &#11088;</div>
        </div>
        <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script>
        </body></html>
      `;

      const w = window.open('', '', 'width=400,height=600');
      w.document.write(html);
      w.document.close();
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data struk.');
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
        { header: 'Total', dataKey: 'total_amount' },
        { header: 'Catatan', dataKey: 'notes' },
      ];

      const data = sales.map((sale, index) => [
        index + 1,
        sale.invoice_number || '-',
        format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm', { locale: id }),
        (sale.channel_name || '') === 'Toko Fisik' ? 'Offline' : 'Online',
        `Rp ${sale.total_amount?.toLocaleString('id-ID') || '0'}`,
        sale.notes || '-',
      ]);

      exportToPDF('Laporan-Penjualan', 'Laporan Penjualan', columns, data);
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengekspor PDF');
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
        { header: 'Total', dataKey: 'total_amount' },
        { header: 'Catatan', dataKey: 'notes' },
      ];

      const data = sales.map((sale, index) => ({
        no: index + 1,
        invoice_number: sale.invoice_number || '-',
        date: format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm', { locale: id }),
        channel_name: (sale.channel_name || '') === 'Toko Fisik' ? 'Offline' : 'Online',
        total_amount: sale.total_amount || '0',
        notes: sale.notes || '-',
      }));

      exportToExcel('Laporan-Penjualan', 'Penjualan', columns, data);
      toast.success('Excel berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengekspor Excel');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex gap-4 items-start">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold page-title section-enter">Penjualan</h1>
            <p className="text-sm text-blue-800/75 mt-1">
              Halo, <strong>{user?.first_name || user?.username}</strong> 👋
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Toggle activity log */}
            <button
              onClick={() => setShowActivityLog(!showActivityLog)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                showActivityLog
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-[#2d4f89] border-blue-200 hover:bg-blue-50'
              }`}
              title="Toggle log aktivitas"
            >
              <FiActivity size={16} />
              <span className="hidden sm:inline">Log Aktivitas</span>
            </button>
            <button
              onClick={() => window.open('/customer-display', '_blank', 'noopener,noreferrer')}
              className="btn-secondary"
            >
              Tampilan Pelanggan
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <FiPlus /> <span>Transaksi Baru</span>
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            disabled={sales.length === 0 || exporting}
            className="btn-export-red flex items-center gap-2"
          >
            {exporting ? '⏳ Sedang...' : '📄 Download PDF'}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={sales.length === 0 || exporting}
            className="btn-export-green flex items-center gap-2"
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
                <tr className="table-head">
                  <th className="pb-3">No. Invoice</th>
                  <th className="pb-3">Tanggal</th>
                  <th className="pb-3">Channel</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Catatan</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="table-row">
                    <td className="py-3 font-mono">
                      <div className="flex items-center gap-2">
                        <span>{sale.invoice_number}</span>
                        <button
                          onClick={() => handlePrintReceipt(sale.id)}
                          className="p-1 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition"
                          title="Cetak Struk"
                        >
                          <FiPrinter size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 text-xs">
                      {format(new Date(sale.created_at), 'dd MMM yyyy HH:mm', {
                        locale: id,
                      })}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        (sale.channel_name || '') === 'Toko Fisik'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {(sale.channel_name || '') === 'Toko Fisik' ? 'Offline' : 'Online'}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-blue-950">
                      Rp {sale.total_amount?.toLocaleString('id-ID') || 0}
                    </td>
                    <td className="py-3 text-blue-900/80 max-w-[150px] truncate" title={sale.notes || ''}>
                      {sale.notes || '-'}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          sale.transaction_status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
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
      </div>

      {/* Activity Log Panel */}
      <ActivityLogPanel
        isOpen={showActivityLog}
        onToggle={() => setShowActivityLog(false)}
      />

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
