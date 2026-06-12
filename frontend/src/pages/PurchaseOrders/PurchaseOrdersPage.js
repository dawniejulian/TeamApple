// frontend/src/pages/PurchaseOrders/PurchaseOrdersPage.js
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiPlus, FiEdit2 } from 'react-icons/fi';
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
  
  // PO Detail & Status checklist modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const canManagePO = String(user?.role || '').toUpperCase() === 'ADMIN';

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

      await api.post('/purchase-orders', payload);
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

  const handleOpenDetail = async (order) => {
    try {
      const res = await api.get(`/purchase-orders/${order.id}`);
      setSelectedOrder(res.data.data.po);
      setOrderItems(res.data.data.items || []);
      setStatusUpdate(res.data.data.po.status);
      setStatusNotes(res.data.data.po.notes || '');
      setShowDetail(true);
    } catch (error) {
      toast.error('Gagal mengambil detail PO');
    }
  };

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    try {
      await api.put(`/purchase-orders/${selectedOrder.id}/status`, {
        status: statusUpdate,
        notes: statusNotes
      });
      toast.success('Status PO berhasil diperbarui');
      setShowDetail(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal memperbarui status PO');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': 'bg-gray-200 text-gray-800',
      'APPROVED': 'bg-blue-200 text-blue-800',
      'SENT': 'bg-yellow-200 text-yellow-800',
      'PARTIAL': 'bg-orange-200 text-orange-800',
      'RECEIVED': 'bg-green-200 text-green-800',
      'CANCELLED': 'bg-red-200 text-red-800'
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold page-title section-enter">Purchase Order</h1>
        {canManagePO && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus size={20} /> Buat PO
          </button>
        )}
      </div>

      {/* Create PO Form Modal */}
      {showForm && (
        <div className="modal-backdrop flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="modal-card rounded-2xl p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-bold mb-4 text-blue-950">Buat Purchase Order Baru</h3>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label mb-2">Nama Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    className="form-input"
                    placeholder="PT. Supplier ABC"
                  />
                </div>
                <div>
                  <label className="form-label mb-2">Email Supplier</label>
                  <input
                    type="email"
                    value={formData.supplier_email}
                    onChange={(e) => setFormData({ ...formData, supplier_email: e.target.value })}
                    className="form-input"
                    placeholder="supplier@example.com"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-3 text-blue-900">Item-item PO</h4>
                {formData.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-3 mb-3">
                    <select
                      value={item.product_id}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[idx].product_id = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="form-input"
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
                      className="form-input"
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
                      className="form-input"
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = formData.items.filter((_, i) => i !== idx);
                          setFormData({ ...formData, items: newItems });
                        }}
                        className="btn-danger"
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
                  className="text-blue-700 text-sm font-semibold hover:text-blue-900"
                >
                  + Tambah Item
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreatePO}
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Buat PO'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 btn-secondary"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="card overflow-x-auto">
        <h2 className="text-xl font-bold mb-4 text-blue-950">Daftar Purchase Order</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="table-head">
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
              <tr key={order.id} className="table-row">
                <td className="py-3 font-semibold text-blue-950">PO-{String(order.id).padStart(5, '0')}</td>
                <td className="py-3 text-blue-900/90">{order.supplier_name}</td>
                <td className="py-3 font-semibold text-blue-950">
                  Rp {parseInt(order.total_amount || 0).toLocaleString('id-ID')}
                </td>
                <td className="py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 text-blue-900/80">
                  {new Date(order.created_at).toLocaleDateString('id-ID')}
                </td>
                <td className="py-3">
                  <button 
                    onClick={() => handleOpenDetail(order)}
                    className="text-blue-600 hover:text-blue-800 font-semibold p-1 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FiEdit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PO Detail & Status Checklist Modal */}
      {showDetail && selectedOrder && (
        <div className="modal-backdrop flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="modal-card rounded-2xl p-6 max-w-2xl w-full my-8 text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-950">Detail Purchase Order</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-blue-900/90 border-b pb-4">
              <div>
                <p><strong>No. PO:</strong> PO-{String(selectedOrder.id).padStart(5, '0')}</p>
                <p><strong>Supplier:</strong> {selectedOrder.supplier_name}</p>
                {selectedOrder.supplier_email && <p><strong>Email:</strong> {selectedOrder.supplier_email}</p>}
              </div>
              <div className="text-right">
                <p><strong>Tgl Buat:</strong> {new Date(selectedOrder.created_at).toLocaleDateString('id-ID')}</p>
                <p><strong>Total:</strong> Rp {parseInt(selectedOrder.total_amount || 0).toLocaleString('id-ID')}</p>
              </div>
            </div>

            <h4 className="font-semibold text-blue-900 mb-2 text-sm">Daftar Item</h4>
            <div className="overflow-x-auto mb-4 border rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-blue-50/50 text-blue-950 border-b">
                    <th className="p-3">Produk</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Diterima</th>
                    <th className="p-3 text-right">Harga</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50/50">
                      <td className="p-3 font-medium text-blue-950">{item.product_name}</td>
                      <td className="p-3 font-mono">{item.sku}</td>
                      <td className="p-3 text-right font-semibold">{item.quantity}</td>
                      <td className="p-3 text-right text-green-600 font-semibold">{item.quantity_received || 0}</td>
                      <td className="p-3 text-right">Rp {parseInt(item.unit_price || 0).toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-semibold">Rp {parseInt(item.line_total || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Checklist / Status Update form */}
            {canManagePO && (
              <div className="border-t pt-4 mt-4 space-y-4">
                <h4 className="font-semibold text-blue-950 text-sm">Perbarui Status Barang & PO</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-blue-900 block mb-1">Checklist Status PO</label>
                    <select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="form-input w-full"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="APPROVED">Disetujui (Approved)</option>
                      <option value="SENT">Sedang Dalam Perjalanan (In Transit / Sent)</option>
                      <option value="RECEIVED">Telah Diterima (Received)</option>
                      <option value="CANCELLED">Dibatalkan (Cancelled)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-blue-900 block mb-1">Catatan / Keterangan</label>
                    <input
                      type="text"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Contoh: Nomor Resi, Ekspedisi, dll."
                      className="form-input w-full"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-semibold">💡 Catatan Alur Stok:</p>
                  <p>• Mengubah ke status <strong>"Sedang Dalam Perjalanan"</strong> akan otomatis menambah angka <strong>"Stok Dipesan"</strong> pada inventori.</p>
                  <p>• Mengubah ke status <strong>"Telah Diterima"</strong> akan otomatis memindahkan jumlah barang ke <strong>"Stok Tersedia"</strong> dan merekam log masuk stok.</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {canManagePO && (
                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {updatingStatus ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              )}
              <button
                onClick={() => setShowDetail(false)}
                className="flex-1 btn-secondary"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
