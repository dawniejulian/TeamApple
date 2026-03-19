// frontend/src/pages/Inventory/InventoryPage.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockForm, setStockForm] = useState({ product_id: '', quantity: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manajemen Stok</h1>

      <div className="card">
        <h2 className="text-lg font-bold mb-3">Tambah Stok Cepat</h2>
        <form onSubmit={handleStockIn} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            className="form-input"
            value={stockForm.product_id}
            onChange={(e) => setStockForm({ ...stockForm, product_id: e.target.value })}
            required
          >
            <option value="">Pilih Produk</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            className="form-input"
            placeholder="Qty"
            value={stockForm.quantity}
            onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
            required
          />

          <input
            type="text"
            className="form-input"
            placeholder="Catatan (opsional)"
            value={stockForm.notes}
            onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
          />

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Menyimpan...' : 'Tambah Stok'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-gray-600">Total Produk</p>
          <p className="text-3xl font-bold">{inventory.length}</p>
        </div>
        <div className="card">
          <p className="text-gray-600">Stok Tersedia</p>
          <p className="text-3xl font-bold">
            {inventory.reduce((sum, item) => sum + Number(item.quantity_available || 0), 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-600">Stok Rusak</p>
          <p className="text-3xl font-bold text-red-600">
            {inventory.reduce((sum, item) => sum + Number(item.quantity_damaged || 0), 0)}
          </p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-3">Produk</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Lokasi</th>
                <th className="pb-3">Tersedia</th>
                <th className="pb-3">Dipesan</th>
                <th className="pb-3">Rusak</th>
                <th className="pb-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{item.product_name}</td>
                  <td className="py-3">{item.sku}</td>
                  <td className="py-3">{item.warehouse_name}</td>
                  <td className="py-3 font-semibold text-green-600">
                    {item.quantity_available}
                  </td>
                  <td className="py-3">{item.quantity_reserved}</td>
                  <td className="py-3 text-red-600">{item.quantity_damaged}</td>
                  <td className="py-3 font-bold">
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
