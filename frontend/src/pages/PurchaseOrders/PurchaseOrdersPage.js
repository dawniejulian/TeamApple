// frontend/src/pages/PurchaseOrders/PurchaseOrdersPage.js
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiPlus, FiEdit2, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_email: '',
    items: [{ product_id: '', quantity: '', price: '' }]
  });
  const [products, setProducts] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const canManagePO = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/purchase-orders');
      setOrders(res.data.data || []);
    } catch (error) {
      toast.error('Gagal mengambil PO');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.data || []);
    } catch (error) {
      console.error('Error fetching products');
    }
  };

  const handleCreatePO = async () => {
    if (!formData.supplier_name || formData.items.some(i => !i.product_id || !i.quantity)) {
      toast.error('Semua field harus diisi');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        supplier_name: formData.supplier_name,
        supplier_email: formData.supplier_email,
        items: formData.items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.price) || 0
        }))
      };

      const res = await api.post('/purchase-orders', payload);
      toast.success('PO berhasil dibuat');
      setShowForm(false);
      setFormData({ supplier_name: '', supplier_email: '', items: [{ product_id: '', quantity: '', price: '' }] });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat PO');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': 'bg-gray-200 text-gray-800',
      'APPROVED': 'bg-blue-200 text-blue-800',
      'SENT': 'bg-yellow-200 text-yellow-800',
      'PARTIAL': 'bg-orange-200 text-orange-800',
      'RECEIVED': 'bg-green-200 text-green-800'
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Purchase Order</h1>
        {canManagePO && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus size={20} /> Buat PO
          </button>
        )}
      </div>

      {/* Create PO Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-bold mb-4">Buat Purchase Order Baru</h3>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="PT. Supplier ABC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Supplier</label>
                  <input
                    type="email"
                    value={formData.supplier_email}
                    onChange={(e) => setFormData({ ...formData, supplier_email: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="supplier@example.com"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-3">Item-item PO</h4>
                {formData.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-3 mb-3">
                    <select
                      value={item.product_id}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[idx].product_id = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="border rounded-lg px-3 py-2"
                    >
                      <option value="">Pilih Produk</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[idx].quantity = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      placeholder="Qty"
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[idx].price = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      placeholder="Harga Satuan"
                      className="border rounded-lg px-3 py-2"
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = formData.items.filter((_, i) => i !== idx);
                          setFormData({ ...formData, items: newItems });
                        }}
                        className="bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      items: [...formData.items, { product_id: '', quantity: '', price: '' }]
                    });
                  }}
                  className="text-blue-600 text-sm font-semibold hover:text-blue-700"
                >
                  + Tambah Item
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreatePO}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Buat PO'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="card overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Daftar Purchase Order</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="pb-3">No. PO</th>
              <th className="pb-3">Supplier</th>
              <th className="pb-3">Total</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Tgl Buat</th>
              <th className="pb-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-3 font-semibold">PO-{String(order.id).padStart(5, '0')}</td>
                <td className="py-3">{order.supplier_name}</td>
                <td className="py-3 font-semibold">
                  Rp {parseInt(order.total_amount || 0).toLocaleString('id-ID')}
                </td>
                <td className="py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3">
                  {new Date(order.created_at).toLocaleDateString('id-ID')}
                </td>
                <td className="py-3">
                  <button className="text-blue-600 hover:text-blue-800 font-semibold">
                    <FiEdit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
