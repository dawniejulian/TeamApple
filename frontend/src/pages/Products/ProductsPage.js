// frontend/src/pages/Products/ProductsPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produk</h1>
        <button
          onClick={() => navigate('/products/new')}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus /> <span>Tambah Produk</span>
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex items-center space-x-2">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            className="form-input border-0"
            value={search}
            onChange={handleSearch}
          />
        </div>
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
              <tr className="border-b">
                <th className="pb-3">SKU</th>
                <th className="pb-3">Nama</th>
                <th className="pb-3">Kategori</th>
                <th className="pb-3">Kondisi</th>
                <th className="pb-3">Harga Jual</th>
                <th className="pb-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{product.sku}</td>
                  <td className="py-3">{product.name}</td>
                  <td className="py-3">{product.category_name}</td>
                  <td className="py-3">{product.condition_name}</td>
                  <td className="py-3 font-semibold">
                    Rp {product.selling_price?.toLocaleString() || 0}
                  </td>
                  <td className="py-3 flex space-x-2">
                    <button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Hapus"
                    >
                      <FiTrash2 />
                    </button>
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
