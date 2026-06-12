// frontend/src/pages/Inventory/InventoryPage.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fast stock input form state
  const [stockForm, setStockForm] = useState({ product_id: '', quantity: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  // Stock status movement form state (Tersedia, Dipesan, Rusak)
  const [statusForm, setStatusForm] = useState({ product_id: '', quantity: '', action: 'reserve', notes: '' });
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      setInventory(res.data.data);
    } catch (error) {
      toast.error('Gagal mengambil data stok');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.data || []);
    } catch (error) {
      toast.error('Gagal mengambil data produk');
    }
  };

  const handleStockIn = async (e) => {
    e.preventDefault();

    if (!stockForm.product_id || !stockForm.quantity || Number(stockForm.quantity) <= 0) {
      toast.error('Pilih produk dan isi quantity yang valid');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/inventory/stock-in', {
        product_id: Number(stockForm.product_id),
        quantity: Number(stockForm.quantity),
        notes: stockForm.notes || 'Tambah stok dari halaman stok'
      });

      toast.success('Stok berhasil ditambahkan');
      setStockForm({ product_id: '', quantity: '', notes: '' });
      fetchInventory();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambah stok');
    } finally {
      setSubmitting(false);
    }
  };


  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    if (!statusForm.product_id || !statusForm.quantity || Number(statusForm.quantity) <= 0 || !statusForm.action) {
      toast.error('Pilih produk, quantity, dan aksi yang valid');
      return;
    }

    setStatusSubmitting(true);
    try {
      await api.post('/inventory/update-status', {
        product_id: Number(statusForm.product_id),
        quantity: Number(statusForm.quantity),
        action: statusForm.action,
        notes: statusForm.notes || `Update status stok: ${statusForm.action}`
      });

      toast.success('Status stok berhasil diperbarui');
      setStatusForm({ product_id: '', quantity: '', action: 'reserve', notes: '' });
      fetchInventory();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui status stok');
    } finally {
      setStatusSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold page-title section-enter">Manajemen Stok</h1>

      {/* Grid for Quick stock additions & Status changes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 section-enter">
        
        {/* Card: Tambah Stok Cepat */}
        <div className="card">
          <h2 className="text-lg font-bold mb-3 text-blue-950">Tambah Stok Cepat</h2>
          <form onSubmit={handleStockIn} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-blue-900 block mb-1">Pilih Produk</label>
                <select
                  className="form-input w-full"
                  value={stockForm.product_id}
                  onChange={(e) => setStockForm({ ...stockForm, product_id: e.target.value })}
                  required
                >
                  <option value="">Pilih Produk</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-900 block mb-1">Jumlah (Qty)</label>
                <input
                  type="number"
                  min="1"
                  className="form-input w-full"
                  placeholder="Qty"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-blue-900 block mb-1">Catatan (opsional)</label>
              <input
                type="text"
                className="form-input w-full"
                placeholder="Catatan tambahan..."
                value={stockForm.notes}
                onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-2 py-2"
            >
              {submitting ? 'Menyimpan...' : 'Tambah Stok'}
            </button>
          </form>
        </div>

        {/* Card: Ubah Status Stok */}
        <div className="card">
          <h2 className="text-lg font-bold mb-3 text-blue-950">Ubah Status Stok</h2>
          <form onSubmit={handleStatusUpdate} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-blue-900 block mb-1">Pilih Produk</label>
                <select
                  className="form-input w-full"
                  value={statusForm.product_id}
                  onChange={(e) => setStatusForm({ ...statusForm, product_id: e.target.value })}
                  required
                >
                  <option value="">Pilih Produk</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-900 block mb-1">Aksi Penandaan</label>
                <select
                  className="form-input w-full"
                  value={statusForm.action}
                  onChange={(e) => setStatusForm({ ...statusForm, action: e.target.value })}
                  required
                >
                  <option value="reserve">Tandai Dipesan (Tersedia ➔ Dipesan)</option>
                  <option value="damage">Tandai Rusak (Tersedia ➔ Rusak)</option>
                  <option value="release-reserve">Batalkan Dipesan (Dipesan ➔ Tersedia)</option>
                  <option value="release-damage">Kembalikan Rusak (Rusak ➔ Tersedia)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <label className="text-xs font-semibold text-blue-900 block mb-1">Jumlah (Qty)</label>
                <input
                  type="number"
                  min="1"
                  className="form-input w-full"
                  placeholder="Qty"
                  value={statusForm.quantity}
                  onChange={(e) => setStatusForm({ ...statusForm, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-blue-900 block mb-1">Keterangan / Catatan</label>
                <input
                  type="text"
                  className="form-input w-full"
                  placeholder="Contoh: Pesanan PO #10 atau Layar Retak..."
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={statusSubmitting}
              className="btn-primary w-full mt-2 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 border-none text-white font-semibold"
            >
              {statusSubmitting ? 'Memproses...' : 'Ubah Status Stok'}
            </button>
          </form>
        </div>

      </div>

      {/* Grid: Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <p className="text-blue-800/75 text-xs font-semibold uppercase tracking-wider">Total Produk</p>
          <p className="text-2xl font-extrabold text-blue-950 mt-1">{inventory.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-blue-800/75 text-xs font-semibold uppercase tracking-wider">Stok Tersedia</p>
          <p className="text-2xl font-extrabold text-green-600 mt-1">
            {inventory.reduce((sum, item) => sum + Number(item.quantity_available || 0), 0)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-blue-800/75 text-xs font-semibold uppercase tracking-wider">Stok Dipesan</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {inventory.reduce((sum, item) => sum + Number(item.quantity_reserved || 0), 0)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-blue-800/75 text-xs font-semibold uppercase tracking-wider">Stok Rusak</p>
          <p className="text-2xl font-extrabold text-red-600 mt-1">
            {inventory.reduce((sum, item) => sum + Number(item.quantity_damaged || 0), 0)}
          </p>
        </div>
        <div className="card p-4 col-span-2 md:col-span-1">
          <p className="text-blue-800/75 text-xs font-semibold uppercase tracking-wider">Total Terjual</p>
          <p className="text-2xl font-extrabold text-blue-800 mt-1">
            {inventory.reduce((sum, item) => sum + Number(item.quantity_sold || 0), 0)}
          </p>
        </div>
      </div>

      {/* Grid Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="table-head">
                <th className="pb-3">Produk</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Tersedia</th>
                <th className="pb-3">Dipesan</th>
                <th className="pb-3">Rusak</th>
                <th className="pb-3">Terjual</th>
                <th className="pb-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="py-3 font-medium text-blue-950">{item.product_name}</td>
                  <td className="py-3 font-mono text-xs">{item.sku}</td>
                  <td className="py-3 font-semibold text-green-600">
                    {item.quantity_available}
                  </td>
                  <td className="py-3 font-semibold text-amber-600">{item.quantity_reserved}</td>
                  <td className="py-3 font-semibold text-red-600">{item.quantity_damaged}</td>
                  <td className="py-3 font-semibold text-blue-800">{item.quantity_sold || 0}</td>
                  <td className="py-3 font-bold text-blue-950">
                    {Number(item.quantity_available || 0) + Number(item.quantity_reserved || 0) + Number(item.quantity_damaged || 0)}
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
