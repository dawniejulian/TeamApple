// frontend/src/components/Modal/AddSaleModal.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CUSTOMER_DISPLAY_KEY = 'kasirin_customer_display';

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

  useEffect(() => {
    if (!formData.product_id || !formData.quantity) return;
    const product = products.find((p) => p.id === parseInt(formData.product_id, 10));
    if (!product) return;

    const quantity = Number(formData.quantity || 0);
    const unitPrice = Number(formData.price_per_unit || product.selling_price || 0);
    const subtotal = quantity * unitPrice;

    const payload = {
      mode: 'ACTIVE_CART',
      updatedAt: new Date().toISOString(),
      invoice_number: 'SEDANG DIPROSES',
      payment_method: '-',
      subtotal,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: subtotal,
      items: [
        {
          product_id: product.id,
          product_name: product.name,
          quantity,
          unit_price: unitPrice,
          subtotal,
        },
      ],
    };

    localStorage.setItem(CUSTOMER_DISPLAY_KEY, JSON.stringify(payload));
  }, [formData.product_id, formData.quantity, formData.price_per_unit, products]);

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
      const response = await api.post('/sales/simple', {
        product_id: parseInt(formData.product_id),
        quantity: parseInt(formData.quantity),
        price_per_unit: parseFloat(formData.price_per_unit),
        sales_channel_id: parseInt(formData.sales_channel_id),
        notes: formData.notes,
      });

      const total = Number(formData.quantity || 0) * Number(formData.price_per_unit || 0);
      const paidPayload = {
        mode: 'PAID',
        updatedAt: new Date().toISOString(),
        invoice_number: response?.data?.data?.invoice_number || 'TRANSAKSI BERHASIL',
        payment_method: 'CASH',
        subtotal: total,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: total,
        items: [
          {
            product_id: selectedProduct?.id,
            product_name: selectedProduct?.name || 'Produk',
            quantity: Number(formData.quantity || 0),
            unit_price: Number(formData.price_per_unit || 0),
            subtotal: total,
          },
        ],
      };
      localStorage.setItem(CUSTOMER_DISPLAY_KEY, JSON.stringify(paidPayload));

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

      setTimeout(() => {
        localStorage.removeItem(CUSTOMER_DISPLAY_KEY);
      }, 7000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan penjualan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="modal-card rounded-2xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-blue-950">Tambah Penjualan</h2>
        
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
            <div className="bg-blue-50/80 p-3 rounded-lg border border-blue-200/70 text-sm text-blue-900">
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
              onClick={() => {
                localStorage.removeItem(CUSTOMER_DISPLAY_KEY);
                onClose();
              }}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
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
