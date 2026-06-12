import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiCamera, FiX, FiTrash2, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import api from '../../services/api';

const CUSTOMER_DISPLAY_KEY = 'kasirin_customer_display';

export default function AddSaleModal({ onClose, onSuccess }) {
  // Global form data
  const [formData, setFormData] = useState({
    sales_channel_id: '1',
    notes: '',
    payment_method: 'CASH',
  });

  // Cart items state
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Active product input state
  const [currentProduct, setCurrentProduct] = useState({
    product_id: '',
    quantity: '1',
    price_per_unit: '',
    discount_percent: '0',
  });

  // Scanner States & Refs
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const scannerRef = useRef(null);
  const wakeLockRef = useRef(null);
  const scannerContainerId = 'modal-barcode-scanner';

  useEffect(() => {
    loadProducts();
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
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

    const matchedProduct = products.find((product) => {
      const pSku = getPrimaryCode(product.sku || '');
      const pBarcode = getPrimaryCode(product.barcode || '');
      return candidates.includes(pSku) || candidates.includes(pBarcode);
    });

    if (matchedProduct) {
      setSelectedProduct(matchedProduct);
      setCurrentProduct({
        product_id: String(matchedProduct.id),
        quantity: '1',
        price_per_unit: matchedProduct.selling_price ? String(matchedProduct.selling_price) : '',
        discount_percent: '0'
      });
      toast.success(`Produk ditemukan: ${matchedProduct.name}`);
      stopScanner();
    } else {
      toast.warn(`Produk dengan SKU/Barcode "${code}" tidak ditemukan`);
    }
  };

  const stopScanner = (keepReady = false) => {
    // Release Wake Lock
    if (wakeLockRef.current) {
      wakeLockRef.current.release()
        .then(() => { wakeLockRef.current = null; })
        .catch((err) => console.error('Error releasing wake lock:', err));
    }

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
    setTorchOn(false);
    setHasTorch(false);
  };

  const startScanner = async () => {
    setScannerError('');
    setScannerOpen(true);
    setScannerReady(false);
    setTorchOn(false);
    setHasTorch(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError('Browser tidak mendukung akses kamera. Gunakan input barcode manual.');
      return;
    }

    // Request Wake Lock to keep screen awake/bright
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Screen Wake Lock acquired');
      }
    } catch (err) {
      console.warn('Screen Wake Lock request failed:', err);
    }

    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode(scannerContainerId);
        scannerRef.current = scanner;

        try {
          await scanner.start(
            { facingMode: "environment" }, // Request back/rear camera directly
            {
              fps: 20, // Speed up scanning
              qrbox: (width, height) => ({
                width: Math.min(width * 0.85, 300),
                height: Math.min(height * 0.35, 110) // Wide and thin for 1D barcodes
              }),
              videoConstraints: {
                facingMode: "environment",
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 }
              },
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

          // Detect if torch is supported
          try {
            const capabilities = scanner.getRunningTrackCapabilities();
            setHasTorch(!!capabilities.torch);
          } catch (capabilitiesError) {
            console.warn('Failed to detect torch capabilities:', capabilitiesError);
            setHasTorch(false);
          }

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

  const toggleTorch = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      const nextTorchState = !torchOn;
      await scanner.applyVideoConstraints({
        advanced: [{ torch: nextTorchState }]
      });
      setTorchOn(nextTorchState);
    } catch (err) {
      console.error('Failed to toggle torch:', err);
      toast.error('Gagal menyalakan senter');
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const handleSelectProduct = (e) => {
    const prodId = e.target.value;
    const product = products.find((p) => p.id === parseInt(prodId, 10));
    setSelectedProduct(product);
    if (product) {
      setCurrentProduct({
        product_id: prodId,
        quantity: '1',
        price_per_unit: String(product.selling_price || ''),
        discount_percent: '0',
      });
    } else {
      setCurrentProduct({
        product_id: '',
        quantity: '1',
        price_per_unit: '',
        discount_percent: '0',
      });
    }
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddToBag = () => {
    if (!currentProduct.product_id || !currentProduct.quantity || Number(currentProduct.quantity) <= 0) {
      toast.error('Pilih produk dan isi jumlah dengan benar');
      return;
    }
    const product = products.find((p) => p.id === parseInt(currentProduct.product_id, 10));
    if (!product) return;

    const qty = parseInt(currentProduct.quantity, 10);
    const unitPrice = parseFloat(currentProduct.price_per_unit || product.selling_price || 0);
    const discPercent = parseFloat(currentProduct.discount_percent || 0);

    const subtotalBefore = qty * unitPrice;
    const discountAmount = subtotalBefore * (discPercent / 100);
    const subtotalAfter = subtotalBefore - discountAmount;

    const newItem = {
      cart_item_id: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      quantity: qty,
      unit_price: unitPrice,
      discount_percent: discPercent,
      subtotal: subtotalAfter,
    };

    setCartItems((prev) => [...prev, newItem]);
    toast.success(`${product.name} dimasukkan ke keranjang`);

    // Reset active selection
    setCurrentProduct({
      product_id: '',
      quantity: '1',
      price_per_unit: '',
      discount_percent: '0',
    });
    setSelectedProduct(null);
  };

  const handleRemoveFromBag = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cart_item_id !== cartItemId));
  };

  // Grand totals calculations
  const totalBeforeDiscount = cartItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const totalDiscount = cartItems.reduce((sum, item) => sum + ((item.quantity * item.unit_price) * (item.discount_percent / 100)), 0);
  const grandTotal = totalBeforeDiscount - totalDiscount;

  // Active product item live discount preview
  const liveQty = parseInt(currentProduct.quantity || 0, 10);
  const livePrice = parseFloat(currentProduct.price_per_unit || 0);
  const liveDiscountPercent = parseFloat(currentProduct.discount_percent || 0);
  const liveBefore = liveQty * livePrice;
  const liveAfter = liveBefore * (1 - liveDiscountPercent / 100);

  // Sync Customer Display in real-time
  useEffect(() => {
    if (cartItems.length === 0) {
      localStorage.removeItem(CUSTOMER_DISPLAY_KEY);
      return;
    }
    const payload = {
      mode: 'ACTIVE_CART',
      updatedAt: new Date().toISOString(),
      invoice_number: 'SEDANG DIPROSES',
      payment_method: formData.payment_method,
      subtotal: totalBeforeDiscount,
      discount_amount: totalDiscount,
      tax_amount: 0,
      total_amount: grandTotal,
      items: cartItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        subtotal: item.subtotal,
      })),
    };
    localStorage.setItem(CUSTOMER_DISPLAY_KEY, JSON.stringify(payload));
  }, [cartItems, totalBeforeDiscount, totalDiscount, grandTotal, formData.payment_method]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Keranjang belanja kosong! Silakan tambahkan minimal 1 produk.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/sales', {
        sales_channel_id: parseInt(formData.sales_channel_id, 10),
        discount_amount: totalDiscount,
        tax_amount: 0,
        payment_method: formData.payment_method,
        notes: formData.notes,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
        })),
      });

      const paidPayload = {
        mode: 'PAID',
        updatedAt: new Date().toISOString(),
        invoice_number: response?.data?.data?.invoice_number || 'TRANSAKSI BERHASIL',
        payment_method: formData.payment_method,
        subtotal: totalBeforeDiscount,
        discount_amount: totalDiscount,
        tax_amount: 0,
        total_amount: grandTotal,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        })),
      };
      localStorage.setItem(CUSTOMER_DISPLAY_KEY, JSON.stringify(paidPayload));

      toast.success('Transaksi penjualan berhasil disimpan!');
      setCartItems([]);
      setFormData({
        sales_channel_id: '1',
        notes: '',
        payment_method: 'CASH',
      });
      onSuccess?.();
      onClose();

      setTimeout(() => {
        localStorage.removeItem(CUSTOMER_DISPLAY_KEY);
      }, 7000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan transaksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="modal-card rounded-3xl p-6 w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden bg-slate-50 border border-blue-100 section-enter">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <FiShoppingCart className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-blue-950">Transaksi POS Baru</h2>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem(CUSTOMER_DISPLAY_KEY);
              onClose();
            }}
            className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-xl transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 overflow-y-auto flex-1 pr-1">
          {/* LEFT: Select & Add to Bag (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-bold text-[#1e355f] uppercase tracking-wider">Pilih Produk</h3>

            {/* Scanner Panel */}
            {scannerOpen && (
              <div className="rounded-2xl border border-blue-100 bg-slate-100 p-3 space-y-2 section-enter shadow-inner">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-blue-950">Arahkan Barcode ke Kamera</p>
                  <div className="flex items-center gap-1.5">
                    {scannerReady && hasTorch && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        className={`p-1 rounded transition border text-[9px] font-bold ${
                          torchOn
                            ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                        }`}
                        title={torchOn ? 'Matikan Senter' : 'Nyalakan Senter'}
                      >
                        <span>⚡ {torchOn ? 'Matikan' : 'Senter'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => stopScanner()}
                      className="p-1 hover:bg-blue-200 rounded text-blue-700 transition"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                </div>
                {scannerError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-2 text-xs">
                    {scannerError}
                  </div>
                ) : null}
                <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-black/90">
                  <div id={scannerContainerId} className="w-full min-h-[160px] max-h-[220px]" />
                </div>
                {!scannerReady && !scannerError && (
                  <p className="text-[10px] text-blue-800/80">Menyiapkan kamera...</p>
                )}
              </div>
            )}

            <div className="space-y-3 bg-white p-4 rounded-2xl border border-blue-100/50 shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="form-label mb-0 text-xs font-semibold">Produk *</label>
                  {!scannerOpen && (
                    <button
                      type="button"
                      onClick={startScanner}
                      className="flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 px-2.5 py-1 rounded-lg transition border border-blue-100"
                    >
                      <FiCamera size={10} />
                      <span>Scan Barcode</span>
                    </button>
                  )}
                </div>
                <select
                  name="product_id"
                  value={currentProduct.product_id}
                  onChange={handleSelectProduct}
                  className="form-input text-sm"
                >
                  <option value="">Pilih Produk</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.sku})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="bg-blue-50/40 p-3 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1.5 section-enter">
                  <p><span className="font-semibold text-blue-950">SKU:</span> {selectedProduct.sku || '-'}</p>
                  <p><span className="font-semibold text-blue-950">Stok Toko:</span> <strong className="text-emerald-700">{selectedProduct.stock_total ?? selectedProduct.quantity_available ?? '-'}</strong></p>
                  <p><span className="font-semibold text-blue-950">Harga Jual:</span> Rp {Number(selectedProduct.selling_price || 0).toLocaleString('id-ID')}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs font-semibold">Jumlah *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={currentProduct.quantity}
                    onChange={handleProductInputChange}
                    className="form-input text-sm"
                    min="1"
                  />
                </div>
                <div>
                  <label className="form-label text-xs font-semibold">Harga Satuan (Rp) *</label>
                  <input
                    type="number"
                    name="price_per_unit"
                    value={currentProduct.price_per_unit}
                    onChange={handleProductInputChange}
                    className="form-input text-sm font-semibold"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Diskon Produk (%)</label>
                <input
                  type="number"
                  name="discount_percent"
                  value={currentProduct.discount_percent}
                  onChange={handleProductInputChange}
                  className="form-input text-sm"
                  min="0"
                  max="100"
                  placeholder="Masukkan % diskon"
                />
              </div>

              {/* Dynamic Live Price Preview */}
              {selectedProduct && liveQty > 0 && livePrice > 0 && (
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 text-xs text-amber-900 space-y-1 section-enter shadow-sm">
                  <p className="font-semibold text-amber-950">Preview Item terpilih:</p>
                  <div className="flex justify-between mt-1">
                    <span>Sebelum Diskon:</span>
                    <span className="line-through text-gray-400">Rp {liveBefore.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-800 text-sm">
                    <span>Setelah Diskon ({liveDiscountPercent}%):</span>
                    <span>Rp {liveAfter.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddToBag}
                className="w-full flex items-center justify-center gap-2 btn-primary py-2.5 rounded-xl font-bold mt-2 shadow"
              >
                <FiPlus size={16} /> Tambahkan ke Keranjang
              </button>
            </div>
          </div>

          {/* RIGHT: Cart List & Submit (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden max-h-full">
            <h3 className="text-sm font-bold text-[#1e355f] uppercase tracking-wider mb-2">Keranjang Belanja</h3>

            {/* Cart Table */}
            <div className="bg-white rounded-2xl border border-blue-100/50 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[220px]">
              <div className="overflow-y-auto flex-1 max-h-[280px]">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                    <FiShoppingCart size={40} className="mb-2 opacity-35" />
                    <p className="text-sm">Keranjang kosong</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-slate-50 text-gray-500 uppercase tracking-wider font-semibold">
                        <th className="p-3">Item</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Sebelum</th>
                        <th className="p-3 text-center">Disc (%)</th>
                        <th className="p-3 text-right">Sesudah</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {cartItems.map((item) => {
                        const beforeSub = item.quantity * item.unit_price;
                        return (
                          <tr key={item.cart_item_id} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <div className="font-semibold text-blue-950">{item.product_name}</div>
                              <div className="text-[10px] text-gray-500 font-mono">{item.sku}</div>
                            </td>
                            <td className="p-3 text-center font-bold text-blue-900">{item.quantity}</td>
                            <td className="p-3 text-right text-gray-400 line-through">
                              Rp {beforeSub.toLocaleString('id-ID')}
                            </td>
                            <td className="p-3 text-center">
                              {item.discount_percent > 0 ? (
                                <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md font-bold text-[10px] border border-red-100">
                                  {item.discount_percent}%
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="p-3 text-right font-bold text-blue-950">
                              Rp {parseInt(item.subtotal).toLocaleString('id-ID')}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveFromBag(item.cart_item_id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded transition"
                                title="Hapus dari keranjang"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Total Summaries Block */}
              <div className="bg-slate-50 border-t border-blue-100 p-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Total Sebelum Diskon:</span>
                  <span className="font-semibold">Rp {totalBeforeDiscount.toLocaleString('id-ID')}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Total Diskon Produk:</span>
                    <span>-Rp {totalDiscount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-blue-950 text-sm border-t border-blue-100/50 pt-1.5">
                  <span>TOTAL AKHIR:</span>
                  <span className="text-blue-600 text-lg">Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* General Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-white p-4 rounded-2xl border border-blue-100/50 shadow-sm">
              <div>
                <label className="form-label text-xs font-semibold">Channel *</label>
                <select
                  name="sales_channel_id"
                  value={formData.sales_channel_id}
                  onChange={(e) => setFormData({ ...formData, sales_channel_id: e.target.value })}
                  className="form-input text-sm"
                  required
                >
                  <option value="1">Toko Fisik (Offline)</option>
                  <option value="2">WhatsApp (Online)</option>
                  <option value="3">Instagram (Online)</option>
                  <option value="4">Marketplace (Online)</option>
                </select>
              </div>

              <div>
                <label className="form-label text-xs font-semibold">Metode Pembayaran *</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="form-input text-sm"
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="TRANSFER">Transfer</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="form-label text-xs font-semibold">Catatan Transaksi</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-input text-sm min-h-[50px]"
                  placeholder="Tambahkan catatan jika diperlukan..."
                  rows="2"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 justify-end mt-auto">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(CUSTOMER_DISPLAY_KEY);
                  onClose();
                }}
                className="btn-secondary px-6 font-bold"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-primary px-8 font-bold shadow-md disabled:opacity-50"
                disabled={loading || cartItems.length === 0}
              >
                {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
