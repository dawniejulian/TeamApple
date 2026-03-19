// frontend/src/components/Modal/AddProductModal.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function AddProductModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    condition_id: '',
    description: '',
    buy_price: '',
    selling_price: '',
    initial_stock: '0',
  });
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategoriesAndConditions();
  }, []);

  const loadCategoriesAndConditions = async () => {
    try {
      const [catRes, condRes] = await Promise.all([
        api.get('/products/categories/list'),
        api.get('/products/conditions/list'),
      ]);
      setCategories(catRes.data.data || []);
      setConditions(condRes.data.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Gagal memuat kategori atau kondisi');
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
      await api.post('/products', {
        name: formData.name,
        sku: formData.sku,
        category_id: parseInt(formData.category_id),
        condition_id: parseInt(formData.condition_id),
        buy_price: parseFloat(formData.buy_price) || 0,
        selling_price: parseFloat(formData.selling_price),
        description: formData.description,
        initial_stock: parseInt(formData.initial_stock || '0', 10),
      });
      toast.success('Produk berhasil ditambahkan');
      setFormData({
        name: '',
        sku: '',
        category_id: '',
        condition_id: '',
        description: '',
        buy_price: '',
        selling_price: '',
        initial_stock: '0',
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Tambah Produk</h2>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="form-label">Nama Produk</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Kategori *</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Pilih Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Kondisi Produk *</label>
            <select
              name="condition_id"
              value={formData.condition_id}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Pilih Kondisi</option>
              {conditions.map(cond => (
                <option key={cond.id} value={cond.id}>{cond.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Harga Beli</label>
            <input
              type="number"
              name="buy_price"
              value={formData.buy_price}
              onChange={handleChange}
              className="form-input"
              step="0.01"
            />
          </div>

          <div>
            <label className="form-label">Harga Jual</label>
            <input
              type="number"
              name="selling_price"
              value={formData.selling_price}
              onChange={handleChange}
              className="form-input"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="form-label">Stok Awal</label>
            <input
              type="number"
              name="initial_stock"
              value={formData.initial_stock}
              onChange={handleChange}
              className="form-input"
              min="0"
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
