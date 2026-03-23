// frontend/src/pages/Products/ProductsPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { exportToPDF, exportToExcel } from '../../utils/export';
import AddProductModal from '../../components/Modal/AddProductModal';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { search: searchTerm },
      });
      setProducts(res.data.data);
    } catch (error) {
      toast.error('Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    // Debounce search
    setTimeout(() => fetchProducts(e.target.value), 300);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Produk berhasil dihapus');
      fetchProducts();
    } catch (error) {
      toast.error('Gagal menghapus produk');
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const columns = [
        { header: 'No', dataKey: 'no' },
        { header: 'Nama Produk', dataKey: 'name' },
        { header: 'SKU', dataKey: 'sku' },
        { header: 'Kategori', dataKey: 'category_name' },
        { header: 'Stok', dataKey: 'stock_total' },
        { header: 'Harga Beli', dataKey: 'purchase_price' },
        { header: 'Harga Jual', dataKey: 'selling_price' },
      ];

      const data = products.map((product, index) => [
        index + 1,
        product.name || '-',
        product.sku || '-',
        product.category_name || '-',
        product.stock_total || 0,
        `Rp ${product.buy_price?.toLocaleString('id-ID') || '0'}`,
        `Rp ${product.selling_price?.toLocaleString('id-ID') || '0'}`,
      ]);

      exportToPDF('Laporan-Produk', 'Laporan Daftar Produk', columns, data);
      toast.success('PDF berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengekspor PDF');
      console.error('Error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const columns = [
        { header: 'No', dataKey: 'no' },
        { header: 'Nama Produk', dataKey: 'name' },
        { header: 'SKU', dataKey: 'sku' },
        { header: 'Kategori', dataKey: 'category_name' },
        { header: 'Stok', dataKey: 'stock_total' },
        { header: 'Harga Beli', dataKey: 'purchase_price' },
        { header: 'Harga Jual', dataKey: 'selling_price' },
      ];

      const data = products.map((product, index) => ({
        no: index + 1,
        name: product.name || '-',
        sku: product.sku || '-',
        category_name: product.category_name || '-',
        stock_total: product.stock_total || 0,
        purchase_price: product.buy_price || '0',
        selling_price: product.selling_price || '0',
      }));

      exportToExcel('Laporan-Produk', 'Produk', columns, data);
      toast.success('Excel berhasil diunduh');
    } catch (error) {
      toast.error('Gagal mengekspor Excel');
      console.error('Error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold page-title section-enter">Produk</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus /> <span>Tambah Produk</span>
        </button>
      </div>

      {/* Search */}
      <div className="card section-enter">
        <div className="flex items-center space-x-2">
          <FiSearch className="text-blue-500" />
          <input
            type="text"
            placeholder="Cari produk..."
            className="form-input border-0"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExportPDF}
          disabled={products.length === 0 || exporting}
          className="btn-export-red flex items-center gap-2"
        >
          {exporting ? '⏳ Sedang...' : '📄 Download PDF'}
        </button>
        <button
          onClick={handleExportExcel}
          disabled={products.length === 0 || exporting}
          className="btn-export-green flex items-center gap-2"
        >
          {exporting ? '⏳ Sedang...' : '📊 Download Excel'}
        </button>
      </div>

      {/* Products Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-center py-8 text-gray-500">Tidak ada produk</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="table-head">
                <th className="pb-3">SKU</th>
                <th className="pb-3">Nama</th>
                <th className="pb-3">Kategori</th>
                <th className="pb-3">Stok</th>
                <th className="pb-3">Harga Beli</th>
                <th className="pb-3">Harga Jual</th>
                <th className="pb-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="table-row">
                  <td className="py-3">{product.sku}</td>
                  <td className="py-3">{product.name}</td>
                  <td className="py-3">{product.category_name || '-'}</td>
                  <td className="py-3 font-semibold">{product.stock_total || 0}</td>
                  <td className="py-3">Rp {product.buy_price?.toLocaleString('id-ID') || 0}</td>
                  <td className="py-3 font-semibold">
                    Rp {product.selling_price?.toLocaleString('id-ID') || 0}
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="p-2 hover:bg-blue-100/80 rounded-lg text-blue-700 transition"
                        title="Edit"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition"
                        title="Hapus"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}
