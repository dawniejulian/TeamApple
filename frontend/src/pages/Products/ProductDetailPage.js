// frontend/src/pages/Products/ProductDetailPage.js
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category_id: '',
    condition_id: '',
    buy_price: '',
    selling_price: '',
    description: ''
  });

  const fetchProduct = useCallback(async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setFormData({
        sku: res.data.data.sku || '',
        name: res.data.data.name || '',
        category_id: res.data.data.category_id || '',
        condition_id: res.data.data.condition_id || '',
        buy_price: res.data.data.buy_price || '',
        selling_price: res.data.data.selling_price || '',
        description: res.data.data.description || ''
      });
    } catch (error) {
      toast.error('Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/products/categories/list');
      setCategories(res.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchConditions = useCallback(async () => {
    try {
      const res = await api.get('/products/conditions/list');
      setConditions(res.data.data);
    } catch (error) {
      console.error('Error fetching conditions:', error);
    }
  }, []);

  useEffect(() => {
    fetchProduct();
    fetchCategories();
    fetchConditions();
  }, [fetchProduct, fetchCategories, fetchConditions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await api.put(`/products/${id}`, {
        name: formData.name,
        buy_price: parseFloat(formData.buy_price),
        selling_price: parseFloat(formData.selling_price),
        description: formData.description
      });
      toast.success('Produk berhasil diperbarui');
      navigate('/products');
    } catch (error) {
      toast.error('Gagal menyimpan produk');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-blue-100 rounded-lg transition"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold page-title section-enter">Edit Produk</h1>
      </div>

      <div className="card max-w-2xl section-enter">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SKU */}
          <div>
            <label className="block text-sm font-semibold mb-2">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              disabled
              className="form-input bg-blue-50"
            />
            <p className="muted-note mt-1">SKU tidak dapat diubah</p>
          </div>

          {/* Nama */}
          <div>
            <label className="block text-sm font-semibold mb-2">Nama Produk *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {/* Kategori & Kondisi */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Kategori</label>
              <select
                name="category_id"
                value={formData.category_id}
                disabled
                className="form-input bg-blue-50"
              >
                <option value="">Pilih Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <p className="muted-note mt-1">Kategori tidak dapat diubah</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Kondisi</label>
              <select
                name="condition_id"
                value={formData.condition_id}
                disabled
                className="form-input bg-blue-50"
              >
                <option value="">Pilih Kondisi</option>
                {conditions.map(cond => (
                  <option key={cond.id} value={cond.id}>{cond.name}</option>
                ))}
              </select>
              <p className="muted-note mt-1">Kondisi tidak dapat diubah</p>
            </div>
          </div>

          {/* Harga */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Harga Beli (Rp)</label>
              <input
                type="number"
                name="buy_price"
                value={formData.buy_price}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Harga Jual (Rp) *</label>
              <input
                type="number"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold mb-2">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              rows="4"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <FiSave /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="btn-secondary"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
