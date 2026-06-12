// frontend/src/pages/Receipt/ReceiptPage.js
import React, { useEffect, useState } from 'react';
import { FiPrinter, FiDownload } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function ReceiptPage() {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saleDetails, setSaleDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSales = sales.filter(sale => 
    (sale.invoice_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sale.sales_number || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleSelectSale = async (saleId) => {
    try {
      const res = await api.get(`/sales/${saleId}`);
      setSelectedSale(saleId);
      setSaleDetails(res.data.data);
    } catch (error) {
      toast.error('Gagal mengambil detail penjualan');
    }
  };

  const handlePrint = () => {
    if (!saleDetails) return;
    window.print();
  };

  const handleDownload = () => {
    if (!saleDetails) return;
    
    const element = document.getElementById('receipt-content');
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(element.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold page-title section-enter">Cetak Struk</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daftar Penjualan */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-blue-950">Daftar Penjualan</h2>
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. Invoice..."
                className="form-input w-full rounded-xl border-blue-200/80 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredSales.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Tidak ada data penjualan</p>
              ) : (
                filteredSales.map(sale => (
                  <button
                    key={sale.id}
                    onClick={() => handleSelectSale(sale.id)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedSale === sale.id
                        ? 'bg-blue-100/80 border-2 border-blue-500'
                        : 'bg-white/60 hover:bg-white border-2 border-blue-100/70'
                    }`}
                  >
                    <div className="font-semibold text-blue-950 font-mono text-sm">{sale.invoice_number || sale.sales_number}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(sale.created_at).toLocaleDateString('id-ID')}
                    </div>
                    <div className="text-sm text-gray-800 font-semibold mt-1">
                      Total: Rp {parseInt(sale.total_amount).toLocaleString('id-ID')}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Preview Struk */}
        <div className="lg:col-span-2">
          {saleDetails ? (
            <div className="card">
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handlePrint}
                  className="btn-primary flex items-center gap-2"
                >
                  <FiPrinter /> Cetak
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-export-green flex items-center gap-2"
                >
                  <FiDownload /> Download
                </button>
              </div>

              {/* Struk Content */}
              <div
                id="receipt-content"
                className="bg-white p-6 border-2 border-gray-300 rounded-lg print:border-0 print:p-0"
                style={{
                  width: '80mm',
                  margin: '0 auto',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: '1.3',
                }}
              >
                {/* Header */}
                <div className="text-center mb-2">
                  <div className="text-lg font-bold text-blue-600 mb-1">💎 TeamApple.Hub</div>
                  <div className="text-xs font-semibold">Toko Apple Terpercaya</div>
                  <div className="text-xs text-gray-700">
                    <div>Jl. Merdeka No. 123, Jakarta</div>
                    <div>Telp: 0812-3456-7890</div>
                    <div>Email: info@teamapplehub.com</div>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-b-4 border-blue-600 my-2"></div>

                {/* Transaction Details */}
                <div className="text-xs mb-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Invoice:</span>
                    <span className="font-bold text-blue-600">{saleDetails.sales_number || saleDetails.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{new Date(saleDetails.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu:</span>
                    <span>{new Date(saleDetails.created_at).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>Admin</span>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-b-2 border-black my-2"></div>

                {/* Items Header */}
                <div className="text-xs font-bold mb-1">
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 0.6fr 1.2fr 1fr', gap: '4px'}}>
                    <div>ITEM</div>
                    <div className="text-center">QTY</div>
                    <div className="text-right">HARGA</div>
                    <div className="text-right">TOTAL</div>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-b-2 border-gray-400 my-1"></div>

                {/* Items */}
                <div className="text-xs mb-2 space-y-1">
                  {saleDetails.items && saleDetails.items.length > 0 ? (
                    saleDetails.items.map((item, idx) => (
                      <div key={idx}>
                        <div className="font-semibold">{item.product_name}</div>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 0.6fr 1.2fr 1fr', gap: '4px', marginTop: '2px'}}>
                          <div>Rp {parseInt(item.price || item.unit_price).toLocaleString('id-ID')}</div>
                          <div className="text-center">{item.quantity}x</div>
                          <div className="text-right"></div>
                          <div className="text-right font-semibold">Rp {parseInt(item.subtotal).toLocaleString('id-ID')}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">Tidak ada item</p>
                  )}
                </div>

                {/* Separator */}
                <div className="border-b-2 border-black my-2"></div>

                {/* Totals Section */}
                <div className="text-xs mb-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">Rp {parseInt(saleDetails.subtotal || 0).toLocaleString('id-ID')}</span>
                  </div>

                  {saleDetails.discount_amount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Diskon</span>
                      <span className="font-semibold">-Rp {parseInt(saleDetails.discount_amount).toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {saleDetails.tax_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Pajak</span>
                      <span className="font-semibold">Rp {parseInt(saleDetails.tax_amount).toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1 px-1 border-2 border-blue-400 rounded font-bold text-sm my-1">
                    <span>TOTAL BAYAR</span>
                    <span className="text-blue-600">Rp {parseInt(saleDetails.total_amount).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="text-xs mb-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Metode Bayar:</span>
                    <span className="font-semibold">{saleDetails.payment_method || 'CASH'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jumlah Bayar:</span>
                    <span className="font-semibold">Rp {parseInt(saleDetails.paid_amount).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Separator */}
                <div className="border-b-2 border-black my-2"></div>

                {/* Footer */}
                <div className="text-center text-xs space-y-1">
                  <div className="font-bold">✓ Terima Kasih Telah Berbelanja ✓</div>
                  <div className="text-gray-700 italic text-xs">
                    Barang yang sudah dibeli tidak dapat<br/>ditukar/dikembalikan
                  </div>
                  <div className="text-gray-700 text-xs">
                    Simpan struk ini untuk garansi produk
                  </div>
                  <div className="border-t border-gray-400 pt-1 mt-1">
                    <div className="text-yellow-600">⭐ Powered by TeamApple.Hub ⭐</div>
                    <div className="text-gray-600">Sistem Manajemen Stok & Penjualan</div>
                    <div className="text-gray-600">Printed: {new Date().toLocaleString('id-ID')}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12 text-gray-500">
              <p className="text-blue-700/75">Pilih penjualan di sebelah kiri untuk melihat preview struk</p>
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          * {
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          #receipt-content {
            width: 80mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 4mm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            font-family: monospace !important;
            font-size: 12px !important;
            line-height: 1.3 !important;
            color: black !important;
            page-break-after: avoid !important;
          }
          
          #receipt-content div {
            margin: inherit !important;
            padding: inherit !important;
          }
          
          #receipt-content .text-center {
            text-align: center !important;
          }
          
          #receipt-content .flex {
            display: flex !important;
          }
          
          #receipt-content .justify-between {
            justify-content: space-between !important;
          }
          
          #receipt-content .border-b-4 {
            border-bottom: 4px solid #2563eb !important;
          }
          
          #receipt-content .border-b-2 {
            border-bottom: 2px solid #000 !important;
          }
          
          #receipt-content .border-black {
            border-color: #000 !important;
          }
          
          #receipt-content .text-xs {
            font-size: 11px !important;
          }
          
          #receipt-content .text-lg {
            font-size: 14px !important;
          }
          
          #receipt-content .font-bold {
            font-weight: bold !important;
          }
          
          #receipt-content .font-semibold {
            font-weight: 600 !important;
          }
          
          #receipt-content .col-span-6 {
            grid-column: span 6 !important;
          }
          
          #receipt-content .col-span-2 {
            grid-column: span 2 !important;
          }
          
          #receipt-content .text-right {
            text-align: right !important;
          }
          
          #receipt-content .font-bold {
            font-weight: bold !important;
          }
          
          #receipt-content .font-semibold {
            font-weight: bold !important;
          }
          
          #receipt-content .border-b {
            border-bottom: 1px solid black !important;
          }
          
          #receipt-content .border-dashed {
            border-style: dashed !important;
          }
          
          #receipt-content .border-gray-400 {
            border-color: gray !important;
          }
          
          #receipt-content .border-b-4 {
            border-bottom: 4px solid !important;
          }
          
          #receipt-content .border-blue-600 {
            border-color: #2563eb !important;
          }
          
          #receipt-content .border-b-2 {
            border-bottom: 2px solid !important;
          }
          
          #receipt-content .bg-blue-50 {
            background: #eff6ff !important;
          }
          
          #receipt-content .bg-yellow-100 {
            background: #fef3c7 !important;
          }
          
          #receipt-content .bg-green-50 {
            background: #f0fdf4 !important;
          }
          
          #receipt-content .text-blue-600 {
            color: #2563eb !important;
          }
          
          #receipt-content .text-green-600 {
            color: #16a34a !important;
          }
          
          #receipt-content .text-red-600 {
            color: #dc2626 !important;
          }
          
          #receipt-content .text-gray-700 {
            color: #374151 !important;
          }
          
          #receipt-content .text-gray-600 {
            color: #4b5563 !important;
          }
          
          #receipt-content .text-gray-800 {
            color: #1f2937 !important;
          }
          
          #receipt-content .text-xs {
            font-size: 11px !important;
          }
          
          #receipt-content .text-sm {
            font-size: 12px !important;
          }
          
          #receipt-content .text-2xl {
            font-size: 18px !important;
          }
          
          #receipt-content .rounded {
            border-radius: 4px !important;
          }
          
          #receipt-content .p-1 {
            padding: 4px !important;
          }
          
          #receipt-content .p-2 {
            padding: 8px !important;
          }
          
          #receipt-content .px-2 {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          
          #receipt-content .py-1 {
            padding-top: 4px !important;
            padding-bottom: 4px !important;
          }
          
          #receipt-content .py-2 {
            padding-top: 8px !important;
            padding-bottom: 8px !important;
          }
          
          #receipt-content .mb-1 {
            margin-bottom: 4px !important;
          }
          
          #receipt-content .mb-2 {
            margin-bottom: 8px !important;
          }
          
          #receipt-content .mb-3 {
            margin-bottom: 12px !important;
          }
          
          #receipt-content .mb-4 {
            margin-bottom: 16px !important;
          }
          
          #receipt-content .pb-2 {
            padding-bottom: 8px !important;
          }
          
          #receipt-content .pb-3 {
            padding-bottom: 12px !important;
          }
          
          #receipt-content .pt-2 {
            padding-top: 8px !important;
          }
          
          #receipt-content .gap-1 {
            gap: 4px !important;
          }
          
          #receipt-content .gap-2 {
            gap: 8px !important;
          }
          
          #receipt-content .space-y-1 > * + * {
            margin-top: 4px !important;
          }
          
          #receipt-content .space-y-2 > * + * {
            margin-top: 8px !important;
          }
          
          #receipt-content .italic {
            font-style: italic !important;
          }
          
          #receipt-content .no-print {
            display: none !important;
          }
          
          button {
            display: none !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
