// frontend/src/pages/Products/ProductsPage.js
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiCamera, FiX, FiShoppingBag, FiExternalLink, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaInstagram, FaTiktok, FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import { SiShopee } from 'react-icons/si';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { exportToPDF, exportToExcel } from '../../utils/export';
import AddProductModal from '../../components/Modal/AddProductModal';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [prefilledBarcode, setPrefilledBarcode] = useState('');
  const [duplicateProduct, setDuplicateProduct] = useState(null);
  const [lastLookupCode, setLastLookupCode] = useState('');
  const scannerContainerId = 'products-barcode-scanner';

  const [viewMode, setViewMode] = useState('table'); // 'table' or 'catalog'
  const [activeSlides, setActiveSlides] = useState({});
  const [failedImages, setFailedImages] = useState({});

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const base = api.defaults.baseURL?.replace('/api', '') || '';
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const moveSlide = (productId, direction, length) => {
    setActiveSlides((prev) => {
      const current = prev[productId] || 0;
      const next = direction === 'next'
        ? (current === length - 1 ? 0 : current + 1)
        : (current === 0 ? length - 1 : current - 1);

      return {
        ...prev,
        [productId]: next,
      };
    });
  };

  const markImageFailed = (productId, imageUrl) => {
    setFailedImages((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [imageUrl]: true,
      },
    }));
  };

  const scannerRef = useRef(null);
  const lastScannedRef = useRef('');
  const lastScanAtRef = useRef(0);

  const navigate = useNavigate();

  const fetchProducts = useCallback(async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { search: searchTerm },
      });
      const list = res.data.data || [];
      setProducts(list);

      const initialSlides = list.reduce((acc, product) => {
        acc[product.id] = 0;
        return acc;
      }, {});
      setActiveSlides(prev => ({ ...initialSlides, ...prev }));

      return list;
    } catch (error) {
      toast.error('Gagal mengambil data produk');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const normalizeCode = (value = '') => value
    .toString()
    .replace(/[\s\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase();

  const getCodeCandidates = (value = '') => {
    const normalized = normalizeCode(value);
    if (!normalized) {
      return [];
    }

    const candidates = [normalized];
    // EAN-13 dimulai '0' → tambah versi 12-digit (UPC-A tanpa leading zero)
    if (/^\d{13}$/.test(normalized) && normalized.startsWith('0')) {
      candidates.push(normalized.slice(1));
    }
    // 12-digit → tambah versi dengan leading '0' (EAN-13)
    if (/^\d{12}$/.test(normalized)) {
      candidates.push(`0${normalized}`);
    }
    // 11-digit → tambah versi dengan leading '0' dan '00'
    if (/^\d{11}$/.test(normalized)) {
      candidates.push(`0${normalized}`);
      candidates.push(`00${normalized}`);
    }

    return [...new Set(candidates)];
  };

  // Kembalikan kode apa adanya — jangan potong digit karena
  // barcode 12-digit yang dimulai '0' (mis. 094...) itu valid UPC-A
  const getPrimaryCode = (value = '') => normalizeCode(value);


  const pickScannedProduct = (list, code) => {
    const codeCandidates = getCodeCandidates(code);
    if (!list || list.length === 0) {
      return null;
    }
    const foundByBarcode = list.find((item) => codeCandidates.includes(normalizeCode(item.barcode)));
    if (foundByBarcode) {
      return foundByBarcode;
    }
    const foundBySku = list.find((item) => codeCandidates.includes(normalizeCode(item.sku)));
    if (foundBySku) {
      return foundBySku;
    }
    
    return null;
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!val) {
      setLastLookupCode('');
      setSelectedProduct(null);
    }
  };

  const handleBarcodeLookup = async (barcode) => {
    const value = getPrimaryCode(barcode);
    const codeCandidates = getCodeCandidates(barcode);
    if (!value) {
      toast.error('Barcode/SKU tidak boleh kosong');
      return;
    }

    setSearch(value);
    setBarcodeInput(value);

    const exactLookup = await api
      .get('/products', { params: { barcode: value } })
      .then((res) => res.data.data || [])
      .catch(() => []);

    let list = exactLookup;
    for (const candidate of codeCandidates) {
      if (list.length > 0 || candidate === value) {
        continue;
      }
      list = await fetchProducts(candidate);
    }
    if (list.length === 0) {
      list = await fetchProducts(value);
    }

    const found = pickScannedProduct(list, value);
    setSelectedProduct(found);

    if (found) {
      toast.success(`Produk ditemukan: ${found.name}`);
      setLastLookupCode('');
    } else {
      toast.warning('Produk tidak ditemukan untuk barcode/SKU tersebut');
      setLastLookupCode(value);
    }
  };

  const stopScanner = (keepError = false) => {
    const scanner = scannerRef.current;
    if (scanner) {
      scanner
        .stop()
        .catch(() => {})
        .finally(() => {
          scanner.clear().catch(() => {});
        });
    }

    scannerRef.current = null;
    setScannerOpen(false);
    setScannerReady(false);
    if (!keepError) {
      setScannerError('');
    }
  };

  const processDetectedCode = async (code) => {
    const normalizedCode = getPrimaryCode(code);
    const now = Date.now();

    if (!normalizedCode) {
      return;
    }

    if (lastScannedRef.current === normalizedCode && now - lastScanAtRef.current < 1800) {
      return;
    }

    lastScannedRef.current = normalizedCode;
    lastScanAtRef.current = now;
    setBarcodeInput(normalizedCode);

    await handleBarcodeLookup(normalizedCode);
    stopScanner();
  };

  const startScanner = async () => {
    setScannerError('');
    setScannerOpen(true);
    setScannerReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError('Browser tidak mendukung akses kamera. Gunakan input barcode manual.');
      return;
    }

    // Delay scanner start to ensure DOM is ready
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
              await processDetectedCode(decodedText);
            },
            () => {
              // Ignore per-frame decode errors and keep scanning.
            }
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

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search, fetchProducts]);

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Produk berhasil dihapus');
      fetchProducts();
    } catch (error) {
      toast.error('Gagal menghapus produk');
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const columns = [
        { header: 'No', dataKey: 'no' },
        { header: 'Nama Produk', dataKey: 'name' },
        { header: 'SKU', dataKey: 'sku' },
        { header: 'Kategori', dataKey: 'category_name' },
        { header: 'Stok', dataKey: 'stock_total' },
        { header: 'Harga Beli', dataKey: 'purchase_price' },
        { header: 'Harga Jual', dataKey: 'selling_price' },
      ];

      const data = products.map((product, index) => [
        index + 1,
        product.name || '-',
        product.sku || '-',
        product.category_name || '-',
        product.stock_total || 0,
        `Rp ${product.buy_price?.toLocaleString('id-ID') || '0'}`,
        `Rp ${product.selling_price?.toLocaleString('id-ID') || '0'}`,
      ]);

      exportToPDF('Laporan-Produk', 'Laporan Daftar Produk', columns, data);
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
        { header: 'Nama Produk', dataKey: 'name' },
        { header: 'SKU', dataKey: 'sku' },
        { header: 'Kategori', dataKey: 'category_name' },
        { header: 'Stok', dataKey: 'stock_total' },
        { header: 'Harga Beli', dataKey: 'purchase_price' },
        { header: 'Harga Jual', dataKey: 'selling_price' },
      ];

      const data = products.map((product, index) => ({
        no: index + 1,
        name: product.name || '-',
        sku: product.sku || '-',
        category_name: product.category_name || '-',
        stock_total: product.stock_total || 0,
        purchase_price: product.buy_price || '0',
        selling_price: product.selling_price || '0',
      }));

      exportToExcel('Laporan-Produk', 'Produk', columns, data);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold page-title section-enter">Produk</h1>
          <p className="text-xs text-blue-800/70 mt-1">Kelola data inventori, cari produk, dan akses katalog visual promosi.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-blue-50/80 p-1 rounded-xl border border-blue-100/50">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-900/70 hover:text-blue-900'
              }`}
            >
              📋 Daftar
            </button>
            <button
              type="button"
              onClick={() => setViewMode('catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                viewMode === 'catalog'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-900/70 hover:text-blue-900'
              }`}
            >
              🖼️ Katalog Visual
            </button>
          </div>
          <button
            onClick={() => {
              setPrefilledBarcode('');
              setShowModal(true);
            }}
            className="btn-primary flex items-center space-x-2 py-2 text-xs font-bold"
          >
            <FiPlus /> <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          {/* Search */}
          <div className="card section-enter">
            <div className="flex items-center space-x-2">
              <FiSearch className="text-blue-500" />
              <input
                type="text"
                placeholder="Cari produk..."
                className="form-input border-0"
                value={search}
                onChange={handleSearch}
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Input barcode / SKU"
                  className="form-input"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleBarcodeLookup(barcodeInput);
                    }
                  }}
                />
                <button
                  onClick={() => handleBarcodeLookup(barcodeInput)}
                  className="btn-secondary whitespace-nowrap"
                >
                  Cari Barcode
                </button>
              </div>

              <button
                onClick={startScanner}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <FiCamera /> Scan Kamera
              </button>
            </div>

            <p className="muted-note mt-2">
              Hasil scan akan dipakai untuk cari produk, lalu tampilkan harga, stok, dan spesifikasi.
            </p>
          </div>

          {/* Scanner Panel */}
          {scannerOpen && (
            <div className="card section-enter">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-blue-950">Scan Barcode Produk</h2>
                <button
                  onClick={stopScanner}
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

          {/* Selected Product Summary */}
          {selectedProduct && (
            <div className="card section-enter space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-blue-950">{selectedProduct.name}</h2>
                  <p className="text-sm text-blue-700/80">SKU: {selectedProduct.sku || '-'}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    Number(selectedProduct.stock_total || 0) <= 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {Number(selectedProduct.stock_total || 0) <= 0
                    ? `Stok Minus/Habis (${selectedProduct.stock_total || 0})`
                    : `Stok Tersedia (${selectedProduct.stock_total || 0})`}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-blue-50 p-3">
                  <p className="text-blue-700/70">Harga Beli</p>
                  <p className="font-semibold text-blue-950">
                    Rp {Number(selectedProduct.buy_price || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3">
                  <p className="text-blue-700/70">Harga Jual</p>
                  <p className="font-semibold text-blue-950">
                    Rp {Number(selectedProduct.selling_price || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-950">Deskripsi</p>
                <p className="text-sm text-blue-900/80">{selectedProduct.description || '-'}</p>
              </div>

              {/* Social Media Links widget */}
              {(() => {
                const SOCIAL_ICONS = {
                  instagram: { Icon: FaInstagram, color: '#E1306C', label: 'Instagram' },
                  tiktok: { Icon: FaTiktok, color: '#010101', label: 'TikTok' },
                  facebook: { Icon: FaFacebookF, color: '#1877F2', label: 'Facebook' },
                  whatsapp: { Icon: FaWhatsapp, color: '#25D366', label: 'WhatsApp' },
                  shopee: { Icon: SiShopee, color: '#EE4D2D', label: 'Shopee' },
                  tokopedia: { Icon: FiShoppingBag, color: '#03AC0E', label: 'Tokopedia' },
                  lazada: { Icon: FiShoppingBag, color: '#0F146D', label: 'Lazada' },
                };
                const sl = selectedProduct.social_links || {};
                const activePlatforms = Object.keys(SOCIAL_ICONS).filter(key => sl[key]);

                if (activePlatforms.length === 0) return null;

                return (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-2">
                    <p className="text-sm font-semibold text-blue-950">🔗 Link Media Sosial</p>
                    <div className="flex flex-wrap gap-2">
                      {activePlatforms.map((key) => {
                        const { Icon, color, label } = SOCIAL_ICONS[key];
                        return (
                          <a
                            key={key}
                            href={sl[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90 hover:scale-102"
                            style={{ backgroundColor: color }}
                          >
                            <Icon size={12} />
                            <span>{label}</span>
                            <FiExternalLink size={10} />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

               <div>
                <p className="text-sm font-semibold text-blue-950">Spesifikasi</p>
                <pre className="text-xs rounded-xl bg-slate-900 text-slate-100 p-3 overflow-x-auto whitespace-pre-wrap">
                  {selectedProduct.specifications
                    ? JSON.stringify(selectedProduct.specifications, null, 2)
                    : 'Belum ada spesifikasi.'}
                </pre>
              </div>

              {/* Other products with the same barcode */}
              {(() => {
                const otherProductsWithSameBarcode = products.filter(
                  (p) => p.id !== selectedProduct.id && p.barcode === selectedProduct.barcode && selectedProduct.barcode
                );
                if (otherProductsWithSameBarcode.length === 0) return null;
                return (
                  <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/40">
                    <p className="text-xs font-semibold text-blue-900 mb-2">📦 Unit lain dengan barcode serupa ({otherProductsWithSameBarcode.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {otherProductsWithSameBarcode.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-blue-100 hover:border-blue-300 text-blue-800 transition"
                        >
                          {p.sku} ({p.condition_name || 'Used'}) - Rp {Number(p.selling_price).toLocaleString('id-ID')}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-blue-100/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPrefilledBarcode(selectedProduct.barcode || barcodeInput);
                    setDuplicateProduct(selectedProduct);
                    setShowModal(true);
                  }}
                  className="btn-secondary flex items-center gap-1.5 text-xs font-bold"
                >
                  <FiPlus /> Daftarkan Produk Lain dengan Barcode Ini
                </button>
              </div>
            </div>
          )}

          {/* Not Found / Register Product */}
          {lastLookupCode && !selectedProduct && (
            <div className="card section-enter border-amber-200 bg-amber-50/50 p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-100/80 rounded-full flex items-center justify-center mx-auto text-amber-600">
                <FiPlus size={24} />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-bold text-amber-950">Produk Tidak Ditemukan</h3>
                <p className="text-sm text-blue-900/80 mt-1">
                  Barcode/SKU <strong className="font-mono text-blue-950">{lastLookupCode}</strong> belum terdaftar.
                  Apakah Anda ingin mendaftarkan produk baru dengan kode ini?
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPrefilledBarcode(lastLookupCode);
                  setShowModal(true);
                }}
                className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold"
              >
                <FiPlus /> Daftarkan Produk Baru
              </button>
            </div>
          )}

          {/* Export Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              disabled={products.length === 0 || exporting}
              className="btn-export-red flex items-center gap-2"
            >
              {exporting ? '⏳ Sedang...' : '📄 Download PDF'}
            </button>
            <button
              onClick={handleExportExcel}
              disabled={products.length === 0 || exporting}
              className="btn-export-green flex items-center gap-2"
            >
              {exporting ? '⏳ Sedang...' : '📊 Download Excel'}
            </button>
          </div>

          {/* Products Table */}
          <div className="card overflow-x-auto">
            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : products.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Tidak ada produk</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="table-head">
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Nama</th>
                    <th className="pb-3">Kategori</th>
                    <th className="pb-3">Stok</th>
                    <th className="pb-3">Harga Beli</th>
                    <th className="pb-3">Harga Jual</th>
                    <th className="pb-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="table-row">
                      <td className="py-3">{product.sku}</td>
                      <td className="py-3">
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="text-left hover:underline text-blue-900"
                        >
                          {product.name}
                        </button>
                      </td>
                      <td className="py-3">{product.category_name || '-'}</td>
                      <td className="py-3 font-semibold">{product.stock_total || 0}</td>
                      <td className="py-3">Rp {product.buy_price?.toLocaleString('id-ID') || 0}</td>
                      <td className="py-3 font-semibold">
                        Rp {product.selling_price?.toLocaleString('id-ID') || 0}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="p-2 hover:bg-blue-100/80 rounded-lg text-blue-700 transition"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition"
                            title="Hapus"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Visual Catalog View */}
          {loading ? (
            <div className="card text-center py-10">Loading katalog...</div>
          ) : products.length === 0 ? (
            <div className="card text-center py-10 text-blue-800/75">Produk tidak ditemukan.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 section-enter">
              {products.map((product) => {
                const allImages = Array.isArray(product.images) ? product.images : [];
                const images = allImages.filter((img) => !failedImages[product.id]?.[img]);
                const activeIndex = activeSlides[product.id] || 0;
                const activeImage = images[activeIndex] || '';

                return (
                  <article key={product.id} className="card p-4 space-y-4">
                    <div className="relative overflow-hidden rounded-2xl bg-slate-200 border border-blue-100">
                      {activeImage ? (
                        <img
                          src={getImageUrl(activeImage)}
                          alt={product.name}
                          className="w-full h-64 object-cover"
                          onError={() => {
                            markImageFailed(product.id, activeImage);
                            if (activeIndex > 0) {
                              setActiveSlides((prev) => ({ ...prev, [product.id]: 0 }));
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center text-blue-700/70 text-sm bg-blue-50">
                          Belum ada foto produk
                        </div>
                      )}

                      {images.length > 1 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => moveSlide(product.id, 'prev', images.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 text-white"
                          >
                            <FiChevronLeft />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSlide(product.id, 'next', images.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 text-white"
                          >
                            <FiChevronRight />
                          </button>
                        </>
                      ) : null}
                    </div>

                    {images.length > 1 ? (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {images.map((img, index) => (
                          <button
                            key={`${product.id}-${img}-${index}`}
                            type="button"
                            onClick={() => setActiveSlides((prev) => ({ ...prev, [product.id]: index }))}
                            className={`rounded-lg overflow-hidden border ${activeIndex === index ? 'border-blue-500' : 'border-blue-100'}`}
                          >
                            <img
                              src={getImageUrl(img)}
                              alt=""
                              className="h-14 w-20 object-cover"
                              onError={() => markImageFailed(product.id, img)}
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {/* Social Media Links under Image */}
                    {(() => {
                      const SOCIAL_ICONS = {
                        instagram: { Icon: FaInstagram, color: '#E1306C', label: 'Instagram' },
                        tiktok: { Icon: FaTiktok, color: '#010101', label: 'TikTok' },
                        facebook: { Icon: FaFacebookF, color: '#1877F2', label: 'Facebook' },
                        whatsapp: { Icon: FaWhatsapp, color: '#25D366', label: 'WhatsApp' },
                        shopee: { Icon: SiShopee, color: '#EE4D2D', label: 'Shopee' },
                        tokopedia: { Icon: FiShoppingBag, color: '#03AC0E', label: 'Tokopedia' },
                        lazada: { Icon: FiShoppingBag, color: '#0F146D', label: 'Lazada' },
                      };
                      const sl = product.social_links || {};
                      const activePlatforms = Object.keys(SOCIAL_ICONS).filter(key => sl[key]);

                      if (activePlatforms.length === 0) return null;

                      return (
                        <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-blue-50/50">
                          <span className="text-xs font-semibold text-blue-900/60 mr-1">Postings:</span>
                          {activePlatforms.map((key) => {
                            const { Icon, color, label } = SOCIAL_ICONS[key];
                            return (
                              <a
                                key={key}
                                href={sl[key]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:opacity-85 transition transform hover:scale-105"
                                style={{ backgroundColor: color }}
                                title={`Buka ${label}`}
                              >
                                <Icon size={13} />
                              </a>
                            );
                          })}
                        </div>
                      );
                    })()}

                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-blue-950 line-clamp-1">{product.name}</h2>
                      <p className="text-sm text-blue-800/80">SKU: {product.sku || '-'}</p>
                      <p className="text-sm text-blue-800/80">Kategori: {product.category_name || '-'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-blue-50 p-3">
                        <p className="text-blue-700/70">Harga Jual</p>
                        <p className="font-bold text-blue-950">Rp {Number(product.selling_price || 0).toLocaleString('id-ID')}</p>
                      </div>
                      <div className="rounded-xl bg-blue-50 p-3">
                        <p className="text-blue-700/70">Stok</p>
                        <p className="font-bold text-blue-950">{Number(product.stock_total || 0)}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 transition"
                      title="Edit produk"
                    >
                      <FiEdit2 size={18} /> Edit Produk
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <AddProductModal
          initialBarcode={prefilledBarcode}
          duplicateProduct={duplicateProduct}
          onClose={() => {
            setShowModal(false);
            setPrefilledBarcode('');
            setDuplicateProduct(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setPrefilledBarcode('');
            setDuplicateProduct(null);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}
