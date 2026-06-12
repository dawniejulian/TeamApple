// frontend/src/pages/Sales/ActivityLogPanel.js
import React, { useState, useEffect, useCallback } from 'react';
import { FiClock, FiRefreshCw, FiActivity, FiX, FiCalendar, FiPrinter } from 'react-icons/fi';
import api from '../../services/api';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const ACTION_LABELS = {
  BUAT_TRANSAKSI: { label: 'Transaksi Baru', color: 'bg-emerald-100 text-emerald-700' },
  BATAL_TRANSAKSI: { label: 'Batal Transaksi', color: 'bg-red-100 text-red-700' },
  DAFTARKAN_PERANGKAT: { label: 'Daftarkan Perangkat', color: 'bg-blue-100 text-blue-700' },
  HAPUS_PERANGKAT: { label: 'Hapus Perangkat', color: 'bg-orange-100 text-orange-700' },
};

function ActionBadge({ action }) {
  const config = ACTION_LABELS[action] || { label: action, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}

export default function ActivityLogPanel({ isOpen, onToggle }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  const fetchLogs = useCallback(async (date) => {
    setLoading(true);
    try {
      const res = await api.get('/activity-logs', { params: { date } });
      setLogs(res.data.data || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableDates = useCallback(async () => {
    try {
      const res = await api.get('/activity-logs/available-dates');
      setAvailableDates(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch available dates:', error);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchLogs(selectedDate);
    fetchAvailableDates();

    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLogs(selectedDate);
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen, selectedDate, fetchLogs, fetchAvailableDates]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleGoToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handlePrintReceipt = async (invoiceNumber) => {
    try {
      const res = await api.get('/sales', { params: { invoice: invoiceNumber } });
      const sales = res.data.data || [];
      const sale = sales.find(s =>
        (s.invoice_number || s.sales_number) === invoiceNumber
      );
      if (!sale) { alert('Data transaksi tidak ditemukan.'); return; }

      // Fetch detail
      const detail = await api.get(`/sales/${sale.id}`);
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
        <html><head><title>Struk ${invoiceNumber}</title>
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
        <div class="flex"><span>Invoice:</span><span class="bold blue">${d.sales_number || d.invoice_number}</span></div>
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
      alert('Gagal memuat data struk.');
    }
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 pointer-events-none'
      }`}
      style={{ minWidth: isOpen ? '320px' : '0' }}
    >
      {isOpen && (
        <div className="h-full bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl flex flex-col shadow-lg"
          style={{ minHeight: 'calc(100vh - 200px)', maxHeight: 'calc(100vh - 140px)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <FiActivity size={14} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1e355f]">Log Aktivitas</h3>
                {lastRefresh && (
                  <p className="text-xs text-gray-400">
                    Diperbarui {format(lastRefresh, 'HH:mm:ss')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchLogs(selectedDate)}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                title="Refresh log"
              >
                <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
                title="Tutup panel"
              >
                <FiX size={14} />
              </button>
            </div>
          </div>

          {/* Date filter */}
          <div className="px-4 py-3 border-b border-blue-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <FiCalendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                />
              </div>
              {selectedDate !== new Date().toISOString().split('T')[0] && (
                <button
                  onClick={handleGoToday}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold whitespace-nowrap"
                >
                  Hari ini
                </button>
              )}
            </div>
          </div>

          {/* Log list */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {loading && logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="w-6 h-6 border-2 border-blue-300 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs">Memuat log...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FiClock size={28} className="mb-2 opacity-40" />
                <p className="text-xs text-center">
                  Belum ada aktivitas<br />
                  {selectedDate === new Date().toISOString().split('T')[0] ? 'hari ini' : 'di tanggal ini'}
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white border border-gray-100 rounded-xl p-3 hover:border-blue-100 transition shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <ActionBadge action={log.action} />
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {format(parseISO(log.created_at), 'HH:mm', { locale: id })}
                    </span>
                  </div>
                  {log.description && (
                    <p className="text-xs text-gray-600 leading-relaxed">{log.description}</p>
                  )}
                  {log.meta?.invoice_number && (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400 font-mono">
                        #{log.meta.invoice_number}
                      </p>
                      {log.action === 'BUAT_TRANSAKSI' && (
                        <button
                          onClick={() => handlePrintReceipt(log.meta.invoice_number)}
                          className="p-1 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition"
                          title="Cetak Struk"
                        >
                          <FiPrinter size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer - count */}
          {logs.length > 0 && (
            <div className="px-4 py-2 border-t border-blue-50 flex-shrink-0">
              <p className="text-xs text-gray-400 text-center">
                {logs.length} aktivitas tercatat
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
