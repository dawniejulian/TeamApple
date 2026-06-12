import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCamera, FiX, FiPrinter } from 'react-icons/fi';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import api from '../../services/api';

const CUSTOMER_DISPLAY_KEY = 'kasirin_customer_display';

const DEFAULT_FORM = {
  product_id: '',
  quantity: '1',
  price_per_unit: '',
  sales_channel_id: '1',
  customer_name: '',
  customer_phone: '',
  payment_method: 'CASH',
  notes: ''
};

export default function SalesFormPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lastSale, setLastSale] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Scanner States & Refs
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const scannerRef = useRef(null);
  const scannerContainerId = 'sales-barcode-scanner';

  useEffect(() => {
    loadProducts();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch((err) => console.error('Error stopping scanner on unmount:', err));
      }
    };
  }, []);

  const getPrimaryCode = (value = '') => value.toString().replace(/[\s\u200B-\u200D\uFEFF]/g, '').trim().toLowerCase();

  const getCodeCandidates = (value = '') => {
    const normalized = getPrimaryCode(value);
    if (!normalized) return [];

    const candidates = [normalized];
    if (/^\d{13}$/.test(normalized) && normalized.startsWith('0')) {
      candidates.push(normalized.slice(1));
    }
    if (/^\d{12}$/.test(normalized)) {
      candidates.push(`0${normalized}`);
    }
    if (/^\d{11}$/.test(normalized)) {
      candidates.push(`0${normalized}`);
      candidates.push(`00${normalized}`);
    }
    return [...new Set(candidates)];
  };

  const processDetectedCode = (code) => {
    const candidates = getCodeCandidates(code);
    if (candidates.length === 0) return;

    // Cari produk yang cocok dengan SKU atau barcode
    const matchedProduct = products.find((product) => {
      const pSku = getPrimaryCode(product.sku || '');
      const pBarcode = getPrimaryCode(product.barcode || '');
      return candidates.includes(pSku) || candidates.includes(pBarcode);
    });

    if (matchedProduct) {
      setSelectedProduct(matchedProduct);
      setFormData((prev) => ({
        ...prev,
        product_id: String(matchedProduct.id),
        price_per_unit: matchedProduct.selling_price ? String(matchedProduct.selling_price) : ''
      }));
      toast.success(`Produk ditemukan: ${matchedProduct.name}`);
      stopScanner();
    } else {
      toast.warn(`Produk dengan SKU/Barcode "${code}" tidak ditemukan`);
    }
  };

  const stopScanner = (keepReady = false) => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current = null;
          if (!keepReady) {
            setScannerOpen(false);
            setScannerReady(false);
          }
        })
        .catch((err) => console.error('Error stopping scanner:', err));
    } else {
      if (!keepReady) {
        setScannerOpen(false);
        setScannerReady(false);
      }
    }
  };

  const startScanner = async () => {
    setScannerError('');
    setScannerOpen(true);
    setScannerReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError('Browser tidak mendukung akses kamera. Gunakan input barcode manual.');
      return;
    }

    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode(scannerContainerId);
        scannerRef.current = scanner;

        let cameras;
        try {
          cameras = await Html5Qrcode.getCameras();
        } catch (cameraError) {
          setScannerError('Tidak bisa mengakses daftar kamera. Pastikan browser memiliki izin akses kamera.');
          stopScanner(true);
          return;
        }

        if (!cameras || cameras.length === 0) {
          setScannerError('Tidak ada kamera yang ditemukan di perangkat ini.');
          stopScanner(true);
          return;
        }

        const preferredCamera = cameras.find((camera) => /back|rear|environment/i.test(camera.label)) || cameras[0];
        const cameraConfig = { deviceId: { exact: preferredCamera.id } };

        try {
          await scanner.start(
            cameraConfig,
            {
              fps: 10,
              qrbox: { width: 300, height: 180 },
              aspectRatio: 1.333333,
              disableFlip: true,
              formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.ITF,
              ],
            },
            async (decodedText) => {
              processDetectedCode(decodedText);
            },
            () => {}
          );

          setScannerReady(true);
        } catch (startError) {
          setScannerError(`Gagal memulai scanner: ${startError.message || 'Kesalahan tidak diketahui'}`);
          stopScanner(true);
        }
      } catch (error) {
        const denied = error?.name === 'NotAllowedError' || error?.name === 'SecurityError';
        setScannerError(
          denied
            ? 'Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser lalu coba lagi.'
            : `Tidak bisa membuka kamera: ${error.message || 'Kesalahan tidak diketahui'}`
        );
        stopScanner(true);
      }
    }, 300);
  };

  const quantityValue = Number(formData.quantity || 0);
  const unitPriceValue = Number(formData.price_per_unit || 0);
  const totalValue = useMemo(() => quantityValue * unitPriceValue, [quantityValue, unitPriceValue]);

  const syncCustomerDisplay = (payload) => {
    localStorage.setItem(CUSTOMER_DISPLAY_KEY, JSON.stringify(payload));
  };

  const clearCustomerDisplay = () => {
    localStorage.removeItem(CUSTOMER_DISPLAY_KEY);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data.data || []);
    } catch (error) {
      toast.error('Gagal memuat daftar produk');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'product_id') {
      const product = products.find((item) => item.id === Number(value));
      setSelectedProduct(product || null);
      setFormData((prev) => ({
        ...prev,
        product_id: value,
        price_per_unit: product?.selling_price ? String(product.selling_price) : ''
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!selectedProduct || !formData.product_id || !formData.quantity) {
      clearCustomerDisplay();
      return;
    }

    const subtotal = totalValue;
    syncCustomerDisplay({
      mode: 'ACTIVE_CART',
      updatedAt: new Date().toISOString(),
      invoice_number: 'SEDANG DIPROSES',
      payment_method: formData.payment_method,
      subtotal,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: subtotal,
      items: [
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          quantity: quantityValue,
          unit_price: unitPriceValue,
          subtotal
        }
      ]
    });

    return () => clearCustomerDisplay();
  }, [selectedProduct, formData.product_id, formData.quantity, formData.price_per_unit, formData.payment_method, totalValue]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedProduct) {
      toast.warn('Pilih produk terlebih dahulu');
      return;
    }

    if (!quantityValue || quantityValue < 1) {
      toast.warn('Jumlah harus minimal 1');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/sales/simple', {
        product_id: Number(formData.product_id),
        quantity: quantityValue,
        price_per_unit: unitPriceValue,
        sales_channel_id: Number(formData.sales_channel_id),
        customer_name: formData.customer_name.trim() || 'Walk-in Customer',
        customer_phone: formData.customer_phone.trim() || null,
        notes: formData.notes.trim() || null,
        payment_method: formData.payment_method
      });

      const saleData = response?.data?.data;
      const invoiceNumber = saleData?.invoice_number || saleData?.sales_number || 'TRANSAKSI BERHASIL';

      syncCustomerDisplay({
        mode: 'PAID',
        updatedAt: new Date().toISOString(),
        invoice_number: invoiceNumber,
        payment_method: formData.payment_method,
        subtotal: totalValue,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: totalValue,
        items: [
          {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            quantity: quantityValue,
            unit_price: unitPriceValue,
            subtotal: totalValue
          }
        ]
      });

      // Simpan data untuk cetak struk
      setLastSale({
        invoice_number: invoiceNumber,
        created_at: new Date().toISOString(),
        payment_method: formData.payment_method,
        customer_name: formData.customer_name.trim() || 'Walk-in Customer',
        subtotal: totalValue,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: totalValue,
        paid_amount: totalValue,
        items: [
          {
            product_name: selectedProduct.name,
            price: unitPriceValue,
            unit_price: unitPriceValue,
            quantity: quantityValue,
            subtotal: totalValue
          }
        ]
      });
      setShowReceipt(true);

      toast.success('Penjualan berhasil disimpan');
      setFormData(DEFAULT_FORM);
      setSelectedProduct(null);

      setTimeout(() => {
        clearCustomerDisplay();
      }, 5000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan penjualan');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setSelectedProduct(null);
    clearCustomerDisplay();
  };

  const handlePrintReceipt = () => {
    if (!lastSale) return;

    const formatRp = (n) => 'Rp ' + parseInt(n || 0).toLocaleString('id-ID');
    const tgl = new Date(lastSale.created_at).toLocaleDateString('id-ID');
    const jam = new Date(lastSale.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const itemsHtml = lastSale.items.map(item => `
      <div style="margin-bottom:4px">
        <div style="font-weight:600">${item.product_name}</div>
        <div style="display:flex;justify-content:space-between">
          <span>${formatRp(item.price || item.unit_price)} x ${item.quantity}</span>
          <span style="font-weight:bold">${formatRp(item.subtotal)}</span>
        </div>
      </div>
    `).join('');

    const html = `
      <html><head><title>Struk ${lastSale.invoice_number}</title>
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
      <div class="flex"><span>Invoice:</span><span class="bold blue">${lastSale.invoice_number}</span></div>
      <div class="flex"><span>Tanggal:</span><span>${tgl}</span></div>
      <div class="flex"><span>Waktu:</span><span>${jam}</span></div>
      <div class="flex"><span>Customer:</span><span>${lastSale.customer_name}</span></div>
      <div class="sep"></div>
      ${itemsHtml}
      <div class="sep"></div>
      <div class="flex total-box bold"><span>TOTAL BAYAR</span><span class="blue">${formatRp(lastSale.total_amount)}</span></div>
      <div class="flex" style="margin-top:4px"><span>Metode Bayar:</span><span class="bold">${lastSale.payment_method}</span></div>
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
  };

  return (
    <div className="space-y-6">

      {/* Modal Cetak Struk */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-lg">
                <FiPrinter size={20} />
                Transaksi Berhasil
              </div>
              <button
                onClick={() => setShowReceipt(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Struk Content */}
            <div
              id="receipt-content"
              style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.4', padding: '16px' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#2563eb' }}>💎 TeamApple.Hub</div>
                <div style={{ fontSize: '11px', fontWeight: '600' }}>Toko Apple Terpercaya</div>
              </div>
              <div style={{ borderBottom: '3px solid #2563eb', margin: '8px 0' }} />
              <div style={{ fontSize: '11px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Invoice:</span>
                  <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{lastSale.invoice_number}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tanggal:</span>
                  <span>{new Date(lastSale.created_at).toLocaleDateString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Waktu:</span>
                  <span>{new Date(lastSale.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Customer:</span>
                  <span>{lastSale.customer_name}</span>
                </div>
              </div>
              <div style={{ borderBottom: '2px solid #000', margin: '6px 0' }} />
              <div style={{ fontSize: '11px', marginBottom: '6px' }}>
                {lastSale.items.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '4px' }}>
                    <div style={{ fontWeight: '600' }}>{item.product_name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Rp {parseInt(item.unit_price).toLocaleString('id-ID')} x {item.quantity}</span>
                      <span style={{ fontWeight: 'bold' }}>Rp {parseInt(item.subtotal).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderBottom: '2px solid #000', margin: '6px 0' }} />
              <div style={{ fontSize: '11px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', border: '2px solid #2563eb', borderRadius: '4px', fontWeight: 'bold' }}>
                  <span>TOTAL BAYAR</span>
                  <span style={{ color: '#2563eb' }}>Rp {parseInt(lastSale.total_amount).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>Metode Bayar:</span>
                  <span style={{ fontWeight: '600' }}>{lastSale.payment_method}</span>
                </div>
              </div>
              <div style={{ borderBottom: '2px solid #000', margin: '6px 0' }} />
              <div style={{ textAlign: 'center', fontSize: '11px' }}>
                <div style={{ fontWeight: 'bold' }}>✓ Terima Kasih Telah Berbelanja ✓</div>
                <div style={{ color: '#6b7280', marginTop: '4px' }}>⭐ Powered by TeamApple.Hub ⭐</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 px-5 py-4 border-t border-gray-100 no-print">
              <button
                onClick={handlePrintReceipt}
                className="btn-primary flex items-center gap-2 flex-1 justify-center"
              >
                <FiPrinter size={16} /> Cetak Struk
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="btn-secondary flex-1"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold page-title section-enter">Form Penjualan Cepat</h1>
          <p className="text-blue-900/80 mt-2">Pilih produk, jumlah, dan harga akan terisi otomatis dari master produk.</p>
        </div>
        <button type="button" onClick={() => navigate('/pos')} className="btn-secondary">
          Kembali ke POS
        </button>
      </div>

      {/* Scanner Panel */}
      {scannerOpen && (
        <div className="card section-enter">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-blue-950">Scan Barcode Produk</h2>
            <button
              type="button"
              onClick={() => stopScanner()}
              className="p-2 hover:bg-blue-100 rounded-lg text-blue-700 transition"
              title="Tutup scanner"
            >
              <FiX size={18} />
            </button>
          </div>

          {scannerError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
              {scannerError}
            </div>
          ) : null}

          <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-black/90">
            <div id={scannerContainerId} className="w-full min-h-[240px] max-h-[360px]" />
          </div>

          {!scannerReady && !scannerError ? (
            <p className="text-sm text-blue-800/80 mt-3">Menyiapkan kamera...</p>
          ) : (
            <p className="text-sm text-blue-800/80 mt-3">Arahkan barcode ke kamera untuk scan otomatis.</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card section-enter space-y-4">
            <div>
              <label className="form-label flex items-center justify-between">
                <span>Produk *</span>
                <button
                  type="button"
                  onClick={startScanner}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-white bg-blue-100 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition"
                >
                  <FiCamera size={13} />
                  <span>Scan Barcode</span>
                </button>
              </label>
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                className="form-input"
                required
                disabled={loading}
              >
                <option value="">{loading ? 'Memuat produk...' : 'Pilih produk'}</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.sku ? `(${product.sku})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Jumlah *</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Harga per Unit *</label>
                <input
                  type="number"
                  name="price_per_unit"
                  min="0"
                  step="0.01"
                  value={formData.price_per_unit}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nama Customer</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Walk-in Customer"
                />
              </div>

              <div>
                <label className="form-label">Nomor HP</label>
                <input
                  type="text"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Opsional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Metode Pembayaran</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="CASH">Cash</option>
                  <option value="QRIS">QRIS</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="DEBIT">Debit</option>
                  <option value="CREDIT">Credit</option>
                </select>
              </div>

              <div>
                <label className="form-label">Sales Channel</label>
                <select
                  name="sales_channel_id"
                  value={formData.sales_channel_id}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="1">Store</option>
                  <option value="2">WhatsApp</option>
                  <option value="3">Instagram</option>
                  <option value="4">Marketplace</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Catatan</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="form-input"
                placeholder="Catatan tambahan transaksi"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={resetForm} className="btn-secondary" disabled={saving}>
              Reset
            </button>
            <button type="submit" className="btn-primary" disabled={saving || loading}>
              {saving ? 'Menyimpan...' : 'Simpan Penjualan'}
            </button>
          </div>
        </div>

        <aside className="card section-enter space-y-4 h-fit">
          <h2 className="text-xl font-bold text-blue-950">Ringkasan Otomatis</h2>

          {selectedProduct ? (
            <div className="space-y-3 text-sm text-blue-900/85 bg-blue-50/30 p-3 rounded-xl border border-blue-100/50">
              {selectedProduct.image_url && (
                <img
                  src={(() => {
                    const base = api.defaults.baseURL?.replace('/api', '') || '';
                    const url = selectedProduct.image_url;
                    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
                  })()}
                  alt={selectedProduct.name}
                  className="w-full h-32 object-cover rounded-lg border border-blue-100"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <p><span className="font-semibold text-blue-950">Nama:</span> {selectedProduct.name}</p>
              <p><span className="font-semibold text-blue-950">SKU:</span> {selectedProduct.sku || '-'}</p>
              {selectedProduct.barcode && (
                <p><span className="font-semibold text-blue-950">Barcode:</span> {selectedProduct.barcode}</p>
              )}
              <p><span className="font-semibold text-blue-950">Stok:</span> {selectedProduct.stock_total ?? selectedProduct.total_quantity ?? selectedProduct.quantity_available ?? '-'}</p>
              <p><span className="font-semibold text-blue-950">Harga Jual:</span> Rp {Number(formData.price_per_unit || selectedProduct.selling_price || 0).toLocaleString('id-ID')}</p>
              {selectedProduct.description && (
                <div className="pt-2 border-t border-blue-100/60 mt-2">
                  <p className="font-semibold text-blue-950 mb-0.5">Deskripsi:</p>
                  <p className="text-xs text-blue-900/80 leading-relaxed max-h-24 overflow-y-auto">{selectedProduct.description}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-blue-800/75 text-sm">Pilih produk atau scan barcode untuk melihat detail produk & harga otomatis.</p>
          )}

          <div className="rounded-xl bg-blue-50/80 border border-blue-200/70 p-4 space-y-2">
            <div className="flex items-center justify-between text-blue-900">
              <span>Subtotal</span>
              <span className="font-bold">Rp {totalValue.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between text-blue-900">
              <span>Diskon</span>
              <span className="font-bold">Rp 0</span>
            </div>
            <div className="flex items-center justify-between text-blue-900">
              <span>Pajak</span>
              <span className="font-bold">Rp 0</span>
            </div>
            <div className="h-px bg-blue-200/70 my-2" />
            <div className="flex items-center justify-between text-lg text-blue-950">
              <span className="font-bold">Total Bayar</span>
              <span className="font-black">Rp {totalValue.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <p className="text-xs text-blue-700/70">
            Saat transaksi disimpan, tampilan pelanggan akan ikut diperbarui otomatis melalui localStorage.
          </p>
        </aside>
      </form>
    </div>
  );
}
