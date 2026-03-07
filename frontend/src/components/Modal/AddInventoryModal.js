// frontend/src/components/Modal/AddInventoryModal.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function AddInventoryModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '1',
    quantity: '',
    notes: '',
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.data || []);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/inventory/stock-in', {
        product_id: parseInt(formData.product_id),
        warehouse_id: parseInt(formData.warehouse_id),
        quantity: parseInt(formData.quantity),
        notes: formData.notes,
      });
      toast.success('Inventory berhasil ditambahkan');
      setFormData({
        product_id: '',
        warehouse_id: '1',
        quantity: '',
        notes: '',
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Tambah Inventory</h2>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="form-label">Produk *</label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Pilih Produk</option>
              {products.map(prod => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} ({prod.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Jumlah Stok yang Ditambahkan *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="form-input"
              min="1"
              required
            />
          </div>

          <div>
            <label className="form-label">Gudang</label>
            <select
              name="warehouse_id"
              value={formData.warehouse_id}
              onChange={handleChange}
              className="form-input"
            >
              <option value="1">Gudang Utama</option>
              <option value="2">Gudang Cabang</option>
            </select>
          </div>

          <div>
            <label className="form-label">Catatan</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-input"
              rows="2"
              placeholder="Contoh: Barang dari supplier A"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
