// frontend/src/components/Modal/AddSaleModal.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function AddSaleModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    price_per_unit: '',
    sales_channel_id: '1',
    notes: '',
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

    if (name === 'product_id') {
      const product = products.find(p => p.id === parseInt(value));
      setSelectedProduct(product);
      if (product) {
        setFormData(prev => ({ ...prev, price_per_unit: product.selling_price }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/sales/simple', {
        product_id: parseInt(formData.product_id),
        quantity: parseInt(formData.quantity),
        price_per_unit: parseFloat(formData.price_per_unit),
        sales_channel_id: parseInt(formData.sales_channel_id),
        notes: formData.notes,
      });
      toast.success('Penjualan berhasil ditambahkan');
      setFormData({
        product_id: '',
        quantity: '',
        price_per_unit: '',
        sales_channel_id: '1',
        notes: '',
      });
      setSelectedProduct(null);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan penjualan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Tambah Penjualan</h2>
        
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

          {selectedProduct && (
            <div className="bg-blue-50 p-3 rounded text-sm">
              <p>Harga Jual: Rp {selectedProduct.selling_price?.toLocaleString('id-ID')}</p>
            </div>
          )}

          <div>
            <label className="form-label">Jumlah *</label>
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
            <label className="form-label">Harga per Unit *</label>
            <input
              type="number"
              name="price_per_unit"
              value={formData.price_per_unit}
              onChange={handleChange}
              className="form-input"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div>
            <label className="form-label">Catatan</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-input"
              rows="2"
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
