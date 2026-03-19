import React, { useEffect, useMemo, useState } from 'react';
import { FiArrowLeft, FiRefreshCw, FiWifiOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CUSTOMER_DISPLAY_KEY = 'kasirin_customer_display';

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

export default function CustomerDisplayPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [sale, setSale] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [mode, setMode] = useState('LATEST_SALE');

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/sales');
  };

  const itemCount = useMemo(() => {
    if (!sale?.items?.length) return 0;
    return sale.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [sale]);

  const fetchLatestSale = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const listRes = await api.get('/sales?status=COMPLETED');
      const sales = listRes?.data?.data || [];

      if (!sales.length) {
        setSale(null);
        setError('Belum ada transaksi selesai hari ini.');
        setMode('LATEST_SALE');
        return;
      }

      const latest = sales[0];
      const detailRes = await api.get(`/sales/${latest.id}`);
      setSale(detailRes?.data?.data || null);
      setError('');
      setUpdatedAt(new Date());
      setMode('LATEST_SALE');
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError('Akses ditolak. Buka layar ini dari browser yang sudah login kasir.');
      } else {
        setError('Tidak dapat mengambil data transaksi. Periksa koneksi backend.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const syncLiveCart = () => {
      const raw = localStorage.getItem(CUSTOMER_DISPLAY_KEY);
      if (!raw) return false;

      try {
        const parsed = JSON.parse(raw);
        if (!parsed?.items?.length) return false;
        setSale(parsed);
        setError('');
        setUpdatedAt(parsed.updatedAt ? new Date(parsed.updatedAt) : new Date());
        setMode(parsed.mode || 'ACTIVE_CART');
        setLoading(false);
        return true;
      } catch (err) {
        return false;
      }
    };

    if (!syncLiveCart()) {
      fetchLatestSale(false);
    }

    const liveTimer = setInterval(() => {
      if (!syncLiveCart()) {
        fetchLatestSale(false);
      }
    }, 2000);

    const handleStorage = (event) => {
      if (event.key !== CUSTOMER_DISPLAY_KEY) return;
      if (!syncLiveCart()) {
        fetchLatestSale(false);
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(liveTimer);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-2xl font-bold tracking-wide">Menyiapkan Tampilan Pelanggan...</div>
          <p className="text-slate-300">Mengambil transaksi terbaru</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="px-8 py-6 border-b border-slate-700 bg-slate-950/80 backdrop-blur">
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-wide">KASIRIN CUSTOMER VIEW</h1>
            <p className="text-slate-300">
              {mode === 'ACTIVE_CART' ? 'Keranjang aktif sedang diproses kasir' : mode === 'PAID' ? 'Pembayaran berhasil' : 'Informasi transaksi terbaru untuk pelanggan'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-500 bg-slate-800 px-4 py-2 font-semibold text-slate-100 hover:bg-slate-700 transition"
            >
              <FiArrowLeft />
              Kembali
            </button>
            <button
              onClick={() => fetchLatestSale(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 sm:p-8">
        {error ? (
          <div className="max-w-5xl mx-auto rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8 text-center">
            <div className="inline-flex items-center gap-2 text-rose-300 text-xl font-semibold">
              <FiWifiOff />
              {error}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 rounded-2xl bg-slate-800/80 p-6 border border-slate-700 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold">Detail Belanja</h2>
                <span className="text-slate-300">{sale?.invoice_number || '-'}</span>
              </div>

              <div className="space-y-3">
                {(sale?.items || []).map((item, idx) => (
                  <div
                    key={`${item.product_id}-${idx}`}
                    className="rounded-xl bg-slate-900/70 border border-slate-700 px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-lg">{item.product_name}</p>
                      <p className="text-slate-400 text-sm">{Number(item.quantity || 0)} x {formatCurrency(item.unit_price || item.price)}</p>
                    </div>
                    <p className="text-xl font-bold text-cyan-300">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-slate-800/80 p-6 border border-slate-700 shadow-2xl space-y-4">
              <h2 className="text-2xl font-bold">Ringkasan</h2>
              <div className="rounded-xl bg-slate-900/70 border border-slate-700 p-4 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Total Item</span>
                  <span className="font-bold text-white">{itemCount}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">{formatCurrency(sale?.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Diskon</span>
                  <span className="font-bold text-rose-300">-{formatCurrency(sale?.discount_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Pajak</span>
                  <span className="font-bold text-emerald-300">{formatCurrency(sale?.tax_amount)}</span>
                </div>
                <div className="h-px bg-slate-700 my-2" />
                <div className="flex justify-between text-2xl font-black">
                  <span>Total Bayar</span>
                  <span className="text-cyan-300">{formatCurrency(sale?.total_amount)}</span>
                </div>
              </div>

              <div className="rounded-xl bg-cyan-500/15 border border-cyan-400/40 p-4">
                <p className="text-cyan-200 text-sm">Metode Pembayaran</p>
                <p className="text-xl font-bold text-cyan-100">{sale?.payment_method || '-'}</p>
              </div>

              <p className="text-xs text-slate-400">
                Update terakhir: {updatedAt ? updatedAt.toLocaleTimeString('id-ID') : '-'}
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
